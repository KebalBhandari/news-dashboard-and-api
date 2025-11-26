import argparse
import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional
from dataclasses import dataclass, asdict
import uuid


@dataclass
class ApiKey:
    id: str
    key_hash: str
    user_id: str
    user_email: str
    name: str
    description: str
    created_at: str
    start_date: str
    expires_at: str
    is_active: bool
    request_count: int
    rate_limit: int
    allowed_endpoints: list[str]
    last_used_at: Optional[str] = None
    ip_whitelist: Optional[list[str]] = None
    metadata: Optional[dict] = None
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "keyHash": self.key_hash,
            "userId": self.user_id,
            "userEmail": self.user_email,
            "name": self.name,
            "description": self.description,
            "createdAt": self.created_at,
            "startDate": self.start_date,
            "expiresAt": self.expires_at,
            "isActive": self.is_active,
            "requestCount": self.request_count,
            "rateLimit": self.rate_limit,
            "allowedEndpoints": self.allowed_endpoints,
            "lastUsedAt": self.last_used_at,
            "ipWhitelist": self.ip_whitelist,
            "metadata": self.metadata
        }


@dataclass
class UsageLog:
    id: str
    api_key_id: str
    endpoint: str
    method: str
    status_code: int
    response_time: int
    timestamp: str
    ip_address: str
    user_agent: str
    query_params: Optional[dict] = None
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "apiKeyId": self.api_key_id,
            "endpoint": self.endpoint,
            "method": self.method,
            "statusCode": self.status_code,
            "responseTime": self.response_time,
            "timestamp": self.timestamp,
            "ipAddress": self.ip_address,
            "userAgent": self.user_agent,
            "queryParams": self.query_params
        }


class FirebaseManager:
    
    def __init__(self, service_account_path: Optional[str] = None):
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore

            if not firebase_admin._apps:
                service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
                if service_account_json:
                    cred = credentials.Certificate(json.loads(service_account_json))
                elif service_account_path:
                    cred = credentials.Certificate(service_account_path)
                else:
                    raise ValueError("Missing Firebase credentials. Set FIREBASE_SERVICE_ACCOUNT_KEY or provide service_account_path.")
                firebase_admin.initialize_app(cred)
            self.db = firestore.client()
            print("Firebase Manager initialized successfully.")
        except ImportError:
            print("Firebase Manager initialized in DEMO MODE (firebase-admin not found).")
            self.db = None
    
    def generate_api_key(self) -> str:
        prefix = "nf_live_"
        random_part = secrets.token_hex(32)
        return f"{prefix}{random_part}"
    
    def hash_api_key(self, key: str) -> str:
        return hashlib.sha256(key.encode()).hexdigest()
    
    def create_api_key(
        self,
        user_id: str,
        user_email: str,
        name: str,
        description: str = "",
        expires_in_days: int = 365,
        rate_limit: int = 1000,
        allowed_endpoints: Optional[list[str]] = None,
        ip_whitelist: Optional[list[str]] = None,
        start_delay_days: int = 0
    ) -> tuple[ApiKey, str]:
        raw_key = self.generate_api_key()
        key_hash = self.hash_api_key(raw_key)
        
        now = datetime.utcnow()
        start_date = now + timedelta(days=start_delay_days)
        expires_at = start_date + timedelta(days=expires_in_days)
        
        api_key = ApiKey(
            id=str(uuid.uuid4()),
            key_hash=key_hash,
            user_id=user_id,
            user_email=user_email,
            name=name,
            description=description,
            created_at=now.isoformat() + "Z",
            start_date=start_date.isoformat() + "Z",
            expires_at=expires_at.isoformat() + "Z",
            is_active=True,
            request_count=0,
            rate_limit=rate_limit,
            allowed_endpoints=allowed_endpoints or ["/api/news", "/api/news/search"],
            ip_whitelist=ip_whitelist
        )
        
        if self.db:
            self.db.collection("apiKeys").document(api_key.id).set(api_key.to_dict())
            print(f"Created API key in Firestore: {api_key.name} (ID: {api_key.id})")
        else:
            print(f"DEMO: Created API key: {api_key.name} (ID: {api_key.id})")
            
        return api_key, raw_key
    
    def validate_api_key(self, raw_key: str) -> Optional[ApiKey]:
        key_hash = self.hash_api_key(raw_key)
        if not self.db: return None
        now = datetime.utcnow()
        
        keys_ref = self.db.collection("apiKeys").where("keyHash", "==", key_hash).limit(1).stream()
        
        for key_doc in keys_ref:
            api_key_data = key_doc.to_dict()
            if api_key_data:
                api_key = ApiKey(**{k.replace('At', '_at').replace('is_', 'is_').replace('Count', '_count').replace('Limit', '_limit').replace('Endpoints', '_endpoints').replace('Whitelist', '_whitelist'): v for k, v in api_key_data.items()})

                # Check if active
                if not api_key.is_active:
                    print("API key is revoked")
                    return None
                
                # Check start date
                start_date = datetime.fromisoformat(api_key.start_date.replace("Z", ""))
                if now < start_date:
                    print("API key not yet active")
                    return None
                
                # Check expiration
                expires_at = datetime.fromisoformat(api_key.expires_at.replace("Z", ""))
                if now > expires_at:
                    print("API key expired")
                    return None
                
                print(f"API key valid: {api_key.name}")
                return api_key

        print("API key not found")
        return None
    
    def revoke_api_key(self, key_id: str) -> bool:
        """Revoke an API key."""
        if not self.db: return False
        key_ref = self.db.collection("apiKeys").document(key_id)
        if key_ref.get().exists:
            key_ref.update({"isActive": False})
            print(f"Revoked API key: {key_id}")
            return True
        return False
    
    def delete_api_key(self, key_id: str) -> bool:
        """Delete an API key permanently."""
        if not self.db: return False
        key_ref = self.db.collection("apiKeys").document(key_id)
        if key_ref.get().exists:
            key_ref.delete()
            print(f"Deleted API key: {key_id}")
            return True
        return False
    
    def get_user_api_keys(self, user_id: str) -> list[ApiKey]:
        """Get all API keys for a user."""
        if not self.db: return []
        keys_ref = self.db.collection("apiKeys").where("userId", "==", user_id).stream()
        return [ApiKey(**{k.replace('At', '_at').replace('is_', 'is_').replace('Count', '_count').replace('Limit', '_limit').replace('Endpoints', '_endpoints').replace('Whitelist', '_whitelist'): v for k, v in key_doc.to_dict().items()}) for key_doc in keys_ref]
    
    def log_usage(
        self,
        api_key_id: str,
        endpoint: str,
        method: str,
        status_code: int,
        response_time: int,
        ip_address: str,
        user_agent: str,
        query_params: Optional[dict] = None
    ) -> UsageLog:
        """Log an API request."""
        if not self.db: return
        log = UsageLog(
            id=str(uuid.uuid4()),
            api_key_id=api_key_id,
            endpoint=endpoint,
            method=method,
            status_code=status_code,
            response_time=response_time,
            timestamp=datetime.utcnow().isoformat() + "Z",
            ip_address=ip_address,
            user_agent=user_agent,
            query_params=query_params
        )
        
        @firestore.transactional
        def update_in_transaction(transaction, key_ref, log_ref, log_data):
            snapshot = key_ref.get(transaction=transaction)
            new_count = snapshot.get("requestCount") + 1
            transaction.update(key_ref, {
                "requestCount": new_count,
                "lastUsedAt": log_data["timestamp"]
            })
            transaction.set(log_ref, log_data)

        key_ref = self.db.collection("apiKeys").document(api_key_id)
        log_ref = self.db.collection("usageLogs").document(log.id)
        transaction = self.db.transaction()
        update_in_transaction(transaction, key_ref, log_ref, log.to_dict())
        
        return log
    
    def check_rate_limit(self, api_key: ApiKey) -> bool:
        """Check if API key is within rate limit."""
        return api_key.request_count < api_key.rate_limit
    
    def get_usage_stats(self, api_key_id: str) -> dict:
        """Get usage statistics for an API key."""
        if not self.db: return {}
        logs_ref = self.db.collection("usageLogs").where("apiKeyId", "==", api_key_id).stream()
        logs = [log.to_dict() for log in logs_ref]
        
        if not logs:
            return {"totalRequests": 0, "avgResponseTime": 0, "successRate": 0}
        
        total = len(logs)
        success = sum(1 for l in logs if 200 <= l.status_code < 300)
        avg_time = sum(l.response_time for l in logs) / total
        
        return {
            "totalRequests": total,
            "avgResponseTime": round(avg_time, 2),
            "successRate": round(success / total * 100, 2),
            "errorCount": total - success
        }


def main():
    """CLI entry point for Firebase Manager."""
    parser = argparse.ArgumentParser(description="NewsFlow Firebase Manager")
    parser.add_argument("--action", "-a", required=True, 
                       choices=["create_key", "validate_key", "revoke_key", "list_keys", "usage_stats"],
                       help="Action to perform")
    parser.add_argument("--user-id", "-u", type=str, help="User ID")
    parser.add_argument("--email", "-e", type=str, help="User email")
    parser.add_argument("--api-key", "-k", type=str, help="API key (for validation)")
    parser.add_argument("--key-id", "-i", type=str, help="API key ID (for revoke)")
    parser.add_argument("--name", "-n", type=str, default="My API Key", help="Key name")
    parser.add_argument("--expires", type=int, default=365, help="Expiry in days")
    parser.add_argument("--rate-limit", type=int, default=1000, help="Daily rate limit")
    
    args = parser.parse_args()
    
    manager = FirebaseManager()
    
    if args.action == "create_key":
        if not args.user_id or not args.email:
            print("Error: --user-id and --email required for create_key")
            return
        
        api_key, raw_key = manager.create_api_key(
            user_id=args.user_id,
            user_email=args.email,
            name=args.name,
            expires_in_days=args.expires,
            rate_limit=args.rate_limit
        )
        
        print("\n" + "=" * 60)
        print("API KEY CREATED SUCCESSFULLY")
        print("=" * 60)
        print(f"Key ID: {api_key.id}")
        print(f"Name: {api_key.name}")
        print(f"Expires: {api_key.expires_at}")
        print(f"Rate Limit: {api_key.rate_limit}/day")
        print("\n⚠️  SAVE THIS KEY - IT WILL NOT BE SHOWN AGAIN:")
        print(f"\n{raw_key}\n")
        print("=" * 60)
    
    elif args.action == "validate_key":
        if not args.api_key:
            print("Error: --api-key required for validate_key")
            return
        
        result = manager.validate_api_key(args.api_key)
        if result:
            print(f"\n✅ Valid API Key")
            print(f"   Name: {result.name}")
            print(f"   User: {result.user_email}")
            print(f"   Requests: {result.request_count}/{result.rate_limit}")
        else:
            print("\n❌ Invalid API Key")
    
    elif args.action == "revoke_key":
        if not args.key_id:
            print("Error: --key-id required for revoke_key")
            return
        
        if manager.revoke_api_key(args.key_id):
            print(f"✅ API key revoked: {args.key_id}")
        else:
            print(f"❌ API key not found: {args.key_id}")
    
    elif args.action == "list_keys":
        if not args.user_id:
            print("Error: --user-id required for list_keys")
            return
        
        keys = manager.get_user_api_keys(args.user_id)
        print(f"\nAPI Keys for user {args.user_id}:")
        print("-" * 60)
        
        if not keys:
            print("No API keys found")
        else:
            for key in keys:
                status = "✅ Active" if key.is_active else "❌ Revoked"
                print(f"  {key.name}")
                print(f"    ID: {key.id}")
                print(f"    Status: {status}")
                print(f"    Requests: {key.request_count}/{key.rate_limit}")
                print(f"    Expires: {key.expires_at}")
                print()
    
    elif args.action == "usage_stats":
        if not args.key_id:
            print("Error: --key-id required for usage_stats")
            return
        
        stats = manager.get_usage_stats(args.key_id)
        print(f"\nUsage Statistics for {args.key_id}:")
        print("-" * 40)
        print(f"  Total Requests: {stats['totalRequests']}")
        print(f"  Avg Response Time: {stats['avgResponseTime']}ms")
        print(f"  Success Rate: {stats['successRate']}%")
        print(f"  Error Count: {stats['errorCount']}")


if __name__ == "__main__":
    main()

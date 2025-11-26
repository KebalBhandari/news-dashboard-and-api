import argparse
import json
import hashlib
import re
from datetime import datetime, timedelta
from typing import Optional
from dataclasses import dataclass, asdict
from enum import Enum
import uuid
import feedparser
from dateutil import parser as date_parser


class NewsCategory(Enum):
    GENERAL = "general"
    BUSINESS = "business"
    TECHNOLOGY = "technology"
    ENTERTAINMENT = "entertainment"
    HEALTH = "health"
    SCIENCE = "science"
    SPORTS = "sports"
    POLITICS = "politics"


@dataclass
class NewsArticle:
    id: str
    title: str
    description: str
    content: str
    url: str
    image_url: str
    source: str
    author: str
    published_at: str
    category: str
    country: str
    language: str
    sentiment: Optional[str] = None
    scraped_at: Optional[str] = None
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "content": self.content,
            "url": self.url,
            "imageUrl": self.image_url,
            "source": self.source,
            "author": self.author,
            "publishedAt": self.published_at,
            "category": self.category,
            "country": self.country,
            "language": self.language,
            "sentiment": self.sentiment,
            "scrapedAt": self.scraped_at or datetime.utcnow().isoformat() + "Z"
        }


# Country configurations
COUNTRIES = {
    "us": {"name": "United States", "sources": ["cnn", "nytimes", "bbc"]},
    "gb": {"name": "United Kingdom", "sources": ["bbc", "guardian", "reuters"]},
    "de": {"name": "Germany", "sources": ["dw", "spiegel"]},
    "fr": {"name": "France", "sources": ["france24", "lemonde"]},
    "in": {"name": "India", "sources": ["timesofindia", "ndtv"]},
    "jp": {"name": "Japan", "sources": ["japantimes", "nhk"]},
    "au": {"name": "Australia", "sources": ["abc", "smh"]},
    "ca": {"name": "Canada", "sources": ["cbc", "globalnews"]},
}

# RSS Feed URLs for various sources
RSS_FEEDS = {
    "general": [
        "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
        "http://feeds.bbci.co.uk/news/rss.xml",
    ],
    "technology": [
        "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
        "http://feeds.bbci.co.uk/news/technology/rss.xml",
    ],
    "business": [
        "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
        "http://feeds.bbci.co.uk/news/business/rss.xml",
    ],
    "science": [
        "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml",
        "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
    ],
    "health": [
        "https://rss.nytimes.com/services/xml/rss/nyt/Health.xml",
        "http://feeds.bbci.co.uk/news/health/rss.xml",
    ],
    "sports": [
        "https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml",
        "http://feeds.bbci.co.uk/sport/rss.xml",
    ],
    "entertainment": [
        "https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml",
        "http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
    ],
}


def generate_article_id(url: str) -> str:
    """Generate a unique ID for an article based on its URL."""
    return hashlib.md5(url.encode()).hexdigest()[:16]


def simple_sentiment_analysis(text: str) -> str:
    """
    Simple rule-based sentiment analysis.
    In production, use a proper NLP model.
    """
    positive_words = [
        "success", "growth", "profit", "win", "breakthrough", "innovation",
        "achievement", "positive", "improve", "gain", "surge", "boost",
        "excellent", "great", "amazing", "wonderful", "fantastic"
    ]
    negative_words = [
        "fail", "loss", "crisis", "crash", "decline", "drop", "fall",
        "concern", "worry", "threat", "danger", "risk", "problem",
        "terrible", "awful", "disaster", "tragic", "devastating"
    ]
    
    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > negative_count:
        return "positive"
    elif negative_count > positive_count:
        return "negative"
    return "neutral"


def scrape_news(
    country: Optional[str] = None,
    category: Optional[str] = None,
    language: str = "en",
    search_query: Optional[str] = None,
    limit: int = 50
) -> dict:
    """
    Main function to scrape news based on filters.
    
    Args:
        country: ISO country code (e.g., 'us', 'gb')
        category: News category (e.g., 'technology', 'business')
        language: Language code (default: 'en')
        search_query: Search query string
        limit: Maximum number of articles to return
        
    Returns:
        Dictionary containing scraped articles and metadata
    """
    print(f"Scraping news with filters:")
    print(f"  Country: {country or 'All'}")
    print(f"  Category: {category or 'All'}")
    print(f"  Language: {language}")
    print(f"  Search: {search_query or 'None'}")
    print()
    
    articles = []
    now = datetime.utcnow()
    
    # Determine which RSS feeds to parse
    feeds_to_parse = []
    if category and category in RSS_FEEDS:
        feeds_to_parse.extend(RSS_FEEDS[category])
    else: # If no category, parse all
        for cat_feeds in RSS_FEEDS.values():
            feeds_to_parse.extend(cat_feeds)

    for feed_url in set(feeds_to_parse):
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries:
                # Basic data extraction
                title = entry.get("title", "No Title")
                url = entry.get("link", "")
                description = entry.get("summary", "")
                
                # Skip if essential data is missing
                if not url or not title:
                    continue

                # Create a NewsArticle object
                article = NewsArticle(
                    id=generate_article_id(url),
                    title=title,
                    description=description,
                    content=entry.get("content", [{}])[0].get("value", description),
                    url=url,
                    image_url=entry.media_content[0]['url'] if hasattr(entry, 'media_content') and entry.media_content else "",
                    source=feed.feed.get("title", "Unknown Source"),
                    author=entry.get("author", "Unknown Author"),
                    published_at=date_parser.parse(entry.get("published")).isoformat() + "Z" if entry.get("published") else now.isoformat() + "Z",
                    category=category or "general",
                    country=country or "us",
                    language=language,
                    sentiment=simple_sentiment_analysis(title + " " + description),
                    scraped_at=now.isoformat() + "Z"
                )
                articles.append(article.to_dict())
        except Exception as e:
            print(f"Error parsing feed {feed_url}: {e}")
    
    # Limit results
    articles = articles[:limit]
    
    result = {
        "success": True,
        "data": {
            "articles": articles,
            "totalResults": len(articles),
            "filter": {
                "country": country,
                "category": category,
                "language": language,
                "search": search_query
            }
        },
        "meta": {
            "scrapedAt": datetime.utcnow().isoformat() + "Z",
            "source": "NewsFlow Scraper"
        }
    }
    
    return result


def main():
    """CLI entry point for the news scraper."""
    parser = argparse.ArgumentParser(description="NewsFlow News Scraper")
    parser.add_argument("--country", "-c", type=str, help="Country code (e.g., us, gb)")
    parser.add_argument("--category", "-t", type=str, help="News category")
    parser.add_argument("--language", "-l", type=str, default="en", help="Language code")
    parser.add_argument("--search", "-s", type=str, help="Search query")
    parser.add_argument("--limit", "-n", type=int, default=20, help="Max articles")
    parser.add_argument("--output", "-o", type=str, help="Output file (JSON)")
    
    args = parser.parse_args()
    
    # Scrape news
    result = scrape_news(
        country=args.country,
        category=args.category,
        language=args.language,
        search_query=args.search,
        limit=args.limit
    )
    
    # Output results
    if args.output:
        with open(args.output, "w") as f:
            json.dump(result, f, indent=2)
        print(f"Results saved to {args.output}")
    else:
        print(json.dumps(result, indent=2))
    
    print(f"\nTotal articles scraped: {result['data']['totalResults']}")


if __name__ == "__main__":
    main()

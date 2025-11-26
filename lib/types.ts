export interface NewsArticle {
  id: string
  title: string
  description: string
  content: string
  url: string
  imageUrl: string
  source: string
  author: string
  publishedAt: string
  category: NewsCategory
  country: string
  language: string
  sentiment?: "positive" | "negative" | "neutral"
  scrapedAt: string
}

export type NewsCategory =
  | "general"
  | "business"
  | "technology"
  | "entertainment"
  | "health"
  | "science"
  | "sports"
  | "politics"

export interface ApiKey {
  id: string
  keyHash: string
  userId: string
  userEmail: string
  name: string
  description: string
  createdAt: string
  expiresAt: string
  startDate: string
  isActive: boolean
  requestCount: number
  rateLimit: number
  allowedEndpoints: string[]
  lastUsedAt?: string
  ipWhitelist?: string[]
  metadata?: Record<string, string>
}

export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  createdAt: string
  plan: "free" | "pro" | "enterprise"
  apiKeys: string[]
}

export interface ApiUsageLog {
  id: string
  apiKeyId: string
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
  timestamp: string
  ipAddress: string
  userAgent: string
  queryParams?: Record<string, string>
}

export interface NewsFilter {
  country?: string
  category?: NewsCategory
  language?: string
  search?: string
  fromDate?: string
  toDate?: string
  source?: string
}

export const COUNTRIES = [
  { code: "af", name: "Afghanistan", flag: "🇦🇫" },
  { code: "ar", name: "Argentina", flag: "🇦🇷" },
  { code: "au", name: "Australia", flag: "🇦🇺" },
  { code: "at", name: "Austria", flag: "🇦🇹" },
  { code: "bd", name: "Bangladesh", flag: "🇧🇩" },
  { code: "be", name: "Belgium", flag: "🇧🇪" },
  { code: "br", name: "Brazil", flag: "🇧🇷" },
  { code: "ca", name: "Canada", flag: "🇨🇦" },
  { code: "cl", name: "Chile", flag: "🇨🇱" },
  { code: "cn", name: "China", flag: "🇨🇳" },
  { code: "co", name: "Colombia", flag: "🇨🇴" },
  { code: "cz", name: "Czech Republic", flag: "🇨🇿" },
  { code: "dk", name: "Denmark", flag: "🇩🇰" },
  { code: "eg", name: "Egypt", flag: "🇪🇬" },
  { code: "fi", name: "Finland", flag: "🇫🇮" },
  { code: "fr", name: "France", flag: "🇫🇷" },
  { code: "de", name: "Germany", flag: "🇩🇪" },
  { code: "gr", name: "Greece", flag: "🇬🇷" },
  { code: "hk", name: "Hong Kong", flag: "🇭🇰" },
  { code: "hu", name: "Hungary", flag: "🇭🇺" },
  { code: "in", name: "India", flag: "🇮🇳" },
  { code: "id", name: "Indonesia", flag: "🇮🇩" },
  { code: "ie", name: "Ireland", flag: "🇮🇪" },
  { code: "il", name: "Israel", flag: "🇮🇱" },
  { code: "it", name: "Italy", flag: "🇮🇹" },
  { code: "jp", name: "Japan", flag: "🇯🇵" },
  { code: "ke", name: "Kenya", flag: "🇰🇪" },
  { code: "kr", name: "South Korea", flag: "🇰🇷" },
  { code: "my", name: "Malaysia", flag: "🇲🇾" },
  { code: "mx", name: "Mexico", flag: "🇲🇽" },
  { code: "ma", name: "Morocco", flag: "🇲🇦" },
  { code: "np", name: "Nepal", flag: "🇳🇵" },
  { code: "nl", name: "Netherlands", flag: "🇳🇱" },
  { code: "nz", name: "New Zealand", flag: "🇳🇿" },
  { code: "ng", name: "Nigeria", flag: "🇳🇬" },
  { code: "no", name: "Norway", flag: "🇳🇴" },
  { code: "pk", name: "Pakistan", flag: "🇵🇰" },
  { code: "ph", name: "Philippines", flag: "🇵🇭" },
  { code: "pl", name: "Poland", flag: "🇵🇱" },
  { code: "pt", name: "Portugal", flag: "🇵🇹" },
  { code: "ro", name: "Romania", flag: "🇷🇴" },
  { code: "ru", name: "Russia", flag: "🇷🇺" },
  { code: "sa", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "sg", name: "Singapore", flag: "🇸🇬" },
  { code: "za", name: "South Africa", flag: "🇿🇦" },
  { code: "es", name: "Spain", flag: "🇪🇸" },
  { code: "lk", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "se", name: "Sweden", flag: "🇸🇪" },
  { code: "ch", name: "Switzerland", flag: "🇨🇭" },
  { code: "tw", name: "Taiwan", flag: "🇹🇼" },
  { code: "th", name: "Thailand", flag: "🇹🇭" },
  { code: "tr", name: "Turkey", flag: "🇹🇷" },
  { code: "ae", name: "UAE", flag: "🇦🇪" },
  { code: "ua", name: "Ukraine", flag: "🇺🇦" },
  { code: "gb", name: "United Kingdom", flag: "🇬🇧" },
  { code: "us", name: "United States", flag: "🇺🇸" },
  { code: "ve", name: "Venezuela", flag: "🇻🇪" },
  { code: "vn", name: "Vietnam", flag: "🇻🇳" },
]

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "ne", name: "Nepali" },
  { code: "bn", name: "Bengali" },
  { code: "ur", name: "Urdu" },
  { code: "th", name: "Thai" },
  { code: "vi", name: "Vietnamese" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "tr", name: "Turkish" },
]

export const CATEGORIES: { value: NewsCategory; label: string; icon: string }[] = [
  { value: "general", label: "General", icon: "📰" },
  { value: "business", label: "Business", icon: "💼" },
  { value: "technology", label: "Technology", icon: "💻" },
  { value: "entertainment", label: "Entertainment", icon: "🎬" },
  { value: "health", label: "Health", icon: "🏥" },
  { value: "science", label: "Science", icon: "🔬" },
  { value: "sports", label: "Sports", icon: "⚽" },
  { value: "politics", label: "Politics", icon: "🏛️" },
]

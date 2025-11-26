import type { NewsArticle, NewsCategory, NewsFilter } from "./types"
import { getAdminFirestore } from "./firebase-admin"
import type { Query } from "firebase-admin/firestore"

export async function scrapeNews(filter: NewsFilter): Promise<NewsArticle[]> {
  try {
    const db = getAdminFirestore()
    let query: Query = db.collection("articles")

    // Apply filters to the Firestore query
    if (filter.country) query = query.where("country", "==", filter.country)
    if (filter.category) query = query.where("category", "==", filter.category)
    if (filter.language) query = query.where("language", "==", filter.language)
    if (filter.source) query = query.where("source", "==", filter.source)
    if (filter.fromDate) query = query.where("publishedAt", ">=", filter.fromDate)
    if (filter.toDate) query = query.where("publishedAt", "<=", filter.toDate)

    // Order by publication date and limit results
    query = query.orderBy("publishedAt", "desc").limit(100)

    const snapshot = await query.get()
    let articles = snapshot.docs.map((doc) => doc.data() as NewsArticle)

    // Perform search filtering in-memory (Firestore doesn't support full-text search)
    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchLower) ||
          a.description.toLowerCase().includes(searchLower) ||
          (a.content && a.content.toLowerCase().includes(searchLower)),
      )
    }

    return articles
  } catch (error) {
    console.error("Error fetching news from Firestore:", error)
    // If there's an error (e.g., missing indexes), log it and return an empty array.
    // The error message in your server logs will contain a link to create the required index.
    return []
  }
}

export async function scrapeNewsFromMultipleSources(filter: NewsFilter): Promise<NewsArticle[]> {
  const allNews = await scrapeNews(filter)
  return allNews
}

export function categorizeNews(articles: NewsArticle[]): Record<NewsCategory, NewsArticle[]> {
  const categorized: Record<NewsCategory, NewsArticle[]> = {
    general: [],
    business: [],
    technology: [],
    entertainment: [],
    health: [],
    science: [],
    sports: [],
    politics: [],
  }

  articles.forEach((article) => {
    if (categorized[article.category]) {
      categorized[article.category].push(article)
    }
  })

  return categorized
}

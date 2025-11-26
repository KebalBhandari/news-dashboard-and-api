"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Check, Code, Book, Zap, Globe } from "lucide-react"

export function ApiDocs() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative">
      <pre className="rounded-lg bg-secondary p-4 overflow-x-auto">
        <code className="text-sm font-mono">{code}</code>
      </pre>
      <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={() => copyCode(code, id)}>
        {copiedCode === id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">API Documentation</h2>
        <p className="text-muted-foreground">Learn how to integrate NewsFlow API into your applications</p>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Start
          </CardTitle>
          <CardDescription>Get started in minutes with these examples</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="node">Node.js</TabsTrigger>
            </TabsList>
            <TabsContent value="curl" className="mt-4">
              <CodeBlock
                id="curl"
                language="bash"
                code={`curl -X GET "https://your-domain.com/api/news?country=us&category=technology" \\
  -H "x-api-key: YOUR_API_KEY"`}
              />
            </TabsContent>
            <TabsContent value="python" className="mt-4">
              <CodeBlock
                id="python"
                language="python"
                code={`import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://your-domain.com/api"

response = requests.get(
    f"{BASE_URL}/news",
    headers={"x-api-key": API_KEY},
    params={
        "country": "us",
        "category": "technology",
        "language": "en"
    }
)

data = response.json()
for article in data["data"]["articles"]:
    print(article["title"])`}
              />
            </TabsContent>
            <TabsContent value="javascript" className="mt-4">
              <CodeBlock
                id="javascript"
                language="javascript"
                code={`const API_KEY = "YOUR_API_KEY";
const BASE_URL = "https://your-domain.com/api";

const response = await fetch(
  \`\${BASE_URL}/news?country=us&category=technology\`,
  {
    headers: {
      "x-api-key": API_KEY
    }
  }
);

const data = await response.json();
data.data.articles.forEach(article => {
  console.log(article.title);
});`}
              />
            </TabsContent>
            <TabsContent value="node" className="mt-4">
              <CodeBlock
                id="node"
                language="javascript"
                code={`const axios = require('axios');

const API_KEY = "YOUR_API_KEY";
const BASE_URL = "https://your-domain.com/api";

async function getNews() {
  const response = await axios.get(\`\${BASE_URL}/news\`, {
    headers: { "x-api-key": API_KEY },
    params: {
      country: "us",
      category: "technology"
    }
  });
  
  return response.data;
}

getNews().then(data => {
  console.log(data.data.articles);
});`}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            API Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* GET /api/news */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-success text-success-foreground">GET</Badge>
              <code className="text-sm font-mono">/api/news</code>
            </div>
            <p className="text-sm text-muted-foreground">
              Fetch news articles with optional filters for country, category, and language.
            </p>
            <div className="rounded-lg border p-4 space-y-2">
              <h4 className="font-medium">Parameters</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <code className="text-primary">country</code>
                  <span className="text-muted-foreground">ISO country code (e.g., us, gb, de)</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-primary">category</code>
                  <span className="text-muted-foreground">News category (technology, business, etc.)</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-primary">language</code>
                  <span className="text-muted-foreground">Language code (default: en)</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-primary">q</code>
                  <span className="text-muted-foreground">Search query string</span>
                </div>
              </div>
            </div>
          </div>

          {/* GET /api/news/search */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-success text-success-foreground">GET</Badge>
              <code className="text-sm font-mono">/api/news/search</code>
            </div>
            <p className="text-sm text-muted-foreground">Search for news articles matching a specific query.</p>
            <div className="rounded-lg border p-4 space-y-2">
              <h4 className="font-medium">Parameters</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <code className="text-primary">q</code>
                  <span className="text-muted-foreground">Search query (required)</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-primary">from</code>
                  <span className="text-muted-foreground">Start date (ISO format)</span>
                </div>
                <div className="flex justify-between">
                  <code className="text-primary">to</code>
                  <span className="text-muted-foreground">End date (ISO format)</span>
                </div>
              </div>
            </div>
          </div>

          {/* GET /api/news/categories */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-success text-success-foreground">GET</Badge>
              <code className="text-sm font-mono">/api/news/categories</code>
            </div>
            <p className="text-sm text-muted-foreground">Get list of available categories, countries, and languages.</p>
          </div>
        </CardContent>
      </Card>

      {/* Response Format */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            Response Format
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            id="response"
            language="json"
            code={`{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "abc123",
        "title": "Article Title",
        "description": "Brief description...",
        "content": "Full article content...",
        "url": "https://source.com/article",
        "imageUrl": "https://...",
        "source": "News Source",
        "author": "John Doe",
        "publishedAt": "2024-01-15T10:30:00Z",
        "category": "technology",
        "country": "us",
        "language": "en"
      }
    ],
    "totalResults": 10
  },
  "meta": {
    "responseTime": "150ms",
    "timestamp": "2024-01-15T10:35:00Z"
  }
}`}
          />
        </CardContent>
      </Card>

      {/* Error Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Error Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <Badge variant="outline">401</Badge>
                <span className="font-medium">Unauthorized</span>
              </div>
              <span className="text-sm text-muted-foreground">Missing or invalid API key</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <Badge variant="outline">403</Badge>
                <span className="font-medium">Forbidden</span>
              </div>
              <span className="text-sm text-muted-foreground">API key expired or revoked</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <Badge variant="outline">429</Badge>
                <span className="font-medium">Rate Limited</span>
              </div>
              <span className="text-sm text-muted-foreground">Daily request limit exceeded</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <Badge variant="outline">500</Badge>
                <span className="font-medium">Server Error</span>
              </div>
              <span className="text-sm text-muted-foreground">Internal server error</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

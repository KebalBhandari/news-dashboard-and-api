"use client"

import { type NewsArticle, CATEGORIES } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Newspaper, TrendingUp, Globe, Clock } from "lucide-react"

interface NewsStatsProps {
  articles: NewsArticle[]
}

export function NewsStats({ articles }: NewsStatsProps) {
  // Category distribution
  const categoryData = CATEGORIES.map((cat) => ({
    name: cat.label,
    value: articles.filter((a) => a.category === cat.value).length,
    icon: cat.icon,
  })).filter((d) => d.value > 0)

  // Sentiment distribution
  const sentimentData = [
    { name: "Positive", value: articles.filter((a) => a.sentiment === "positive").length, fill: "#22c55e" },
    { name: "Neutral", value: articles.filter((a) => a.sentiment === "neutral").length, fill: "#94a3b8" },
    { name: "Negative", value: articles.filter((a) => a.sentiment === "negative").length, fill: "#ef4444" },
  ].filter((d) => d.value > 0)

  // Source distribution
  const sourceCount: Record<string, number> = {}
  articles.forEach((a) => {
    sourceCount[a.source] = (sourceCount[a.source] || 0) + 1
  })
  const sourceData = Object.entries(sourceCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Articles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
          <Newspaper className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{articles.length}</div>
          <p className="text-xs text-muted-foreground">From various sources</p>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{categoryData.length}</div>
          <p className="text-xs text-muted-foreground">Active categories</p>
        </CardContent>
      </Card>

      {/* Sources */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Sources</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Object.keys(sourceCount).length}</div>
          <p className="text-xs text-muted-foreground">News sources</p>
        </CardContent>
      </Card>

      {/* Latest Update */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Latest Update</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Now</div>
          <p className="text-xs text-muted-foreground">Real-time data</p>
        </CardContent>
      </Card>

      {/* Category Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Articles by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: {
                label: "Articles",
                color: "hsl(var(--primary))",
              },
            }}
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Sentiment Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              positive: { label: "Positive", color: "#22c55e" },
              neutral: { label: "Neutral", color: "#94a3b8" },
              negative: { label: "Negative", color: "#ef4444" },
            }}
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="flex justify-center gap-4 mt-2">
            {sentimentData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                <span className="text-xs text-muted-foreground">{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { type NewsFilter, COUNTRIES, LANGUAGES, CATEGORIES } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, X, Globe, Languages, Tag, Loader2 } from "lucide-react"

interface NewsFiltersProps {
  onFilterChange: (filters: NewsFilter) => void
  currentFilters: NewsFilter
  isLoading?: boolean
}

export function NewsFilters({ onFilterChange, currentFilters, isLoading }: NewsFiltersProps) {
  const [localFilters, setLocalFilters] = useState<NewsFilter>(currentFilters)

  const handleFilterChange = (key: keyof NewsFilter, value: string | undefined) => {
    const newFilters = { ...localFilters, [key]: value || undefined }
    setLocalFilters(newFilters)
  }

  const applyFilters = () => {
    onFilterChange(localFilters)
  }

  const clearFilters = () => {
    const emptyFilters: NewsFilter = { language: "en" }
    setLocalFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const hasActiveFilters =
    localFilters.country ||
    localFilters.category ||
    localFilters.search ||
    (localFilters.language && localFilters.language !== "en")

  return (
    <Card className="border-border/40 shadow-lg shadow-black/5">
      <CardHeader className="pb-4 px-5 pt-5">
        <CardTitle className="flex items-center gap-2.5 text-lg font-semibold">
          <div className="rounded-lg bg-primary/10 p-2">
            <Filter className="h-4 w-4 text-primary" />
          </div>
          Filter News
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 px-5 pb-5">
        {/* Search */}
        <div className="space-y-2.5">
          <Label htmlFor="search" className="text-sm font-medium flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            Search
          </Label>
          <Input
            id="search"
            placeholder="Search news articles..."
            value={localFilters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="h-11 bg-muted/50 border-border/50 focus:bg-background transition-colors"
          />
        </div>

        {/* Country */}
        <div className="space-y-2.5">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Country
          </Label>
          <Select
            value={localFilters.country || "all"}
            onValueChange={(value) => handleFilterChange("country", value === "all" ? undefined : value)}
          >
            <SelectTrigger className="h-11 bg-muted/50 border-border/50 focus:bg-background transition-colors">
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent className="max-h-[280px]">
              <SelectItem value="all">All Countries</SelectItem>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">{country.flag}</span>
                    <span>{country.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="space-y-2.5">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            Category
          </Label>
          <Select
            value={localFilters.category || "all"}
            onValueChange={(value) => handleFilterChange("category", value === "all" ? undefined : value)}
          >
            <SelectTrigger className="h-11 bg-muted/50 border-border/50 focus:bg-background transition-colors">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">{category.icon}</span>
                    <span>{category.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div className="space-y-2.5">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            Language
          </Label>
          <Select
            value={localFilters.language || "en"}
            onValueChange={(value) => handleFilterChange("language", value)}
          >
            <SelectTrigger className="h-11 bg-muted/50 border-border/50 focus:bg-background transition-colors">
              <SelectValue placeholder="English" />
            </SelectTrigger>
            <SelectContent className="max-h-[280px]">
              {LANGUAGES.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-3">
          <Button onClick={applyFilters} className="flex-1 h-11 font-medium" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            {isLoading ? "Loading..." : "Apply Filters"}
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="h-11 px-4 bg-transparent" disabled={isLoading}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Active filters indicator */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Active filters:{" "}
              {[
                localFilters.country && COUNTRIES.find((c) => c.code === localFilters.country)?.name,
                localFilters.category,
                localFilters.search && `"${localFilters.search}"`,
                localFilters.language !== "en" && LANGUAGES.find((l) => l.code === localFilters.language)?.name,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

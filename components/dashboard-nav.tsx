"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Newspaper, Key, BookOpen, Moon, Sun, Menu, X, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

const navItems = [
  { href: "/", label: "News", icon: Newspaper },
  { href: "/api-keys", label: "API Keys", icon: Key },
  { href: "/docs", label: "API Docs", icon: BookOpen },
]

export function DashboardNav() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  // Get user initials for avatar
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky px-6 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between" style={{width:'100%'}}>
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-1.5">
              <Newspaper className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">NewsFlow</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Button variant="ghost" size="sm" className={cn("gap-2", pathname === item.href && "bg-secondary")}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/api-keys" className="flex items-center cursor-pointer">
                    <Key className="mr-2 h-4 w-4" />
                    <span>API Keys</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/docs" className="flex items-center cursor-pointer">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Documentation</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn("w-full justify-start gap-2", pathname === item.href && "bg-secondary")}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
            {user && (
              <>
                <div className="border-t my-2" />
                <div className="px-2 py-1 text-sm text-muted-foreground">Signed in as {user.email}</div>
                <Button variant="ghost" className="w-full justify-start gap-2 text-destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

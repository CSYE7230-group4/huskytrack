import type React from "react"
import Link from "next/link"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-8 py-6">
        <Link href="/" className="inline-block">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-primary">Husky</span>
            <span className="text-sm text-muted-foreground uppercase tracking-wider">Tracker</span>
          </div>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-8 py-6">
        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms & Conditions
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  )
}

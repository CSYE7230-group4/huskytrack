import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LandingHeader() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold text-primary">
            Husky
            <span className="block text-xs font-normal uppercase tracking-wider text-muted-foreground">Tracker</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-primary hover:text-primary">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

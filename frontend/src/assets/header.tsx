import { Bell, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">Husky</div>
            <div className="text-sm text-muted-foreground">Tracker</div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 ml-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/professional-headshot.png" alt="Sam Peterson" />
                <AvatarFallback>SP</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Sam Peterson</span>
                <span className="text-xs text-muted-foreground">Student</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Pagination() {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button variant="outline" size="icon" className="rounded-full bg-transparent">
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button variant="default" size="icon" className="rounded-full">
        1
      </Button>
      <Button variant="outline" size="icon" className="rounded-full bg-transparent">
        2
      </Button>
      <Button variant="outline" size="icon" className="rounded-full bg-transparent">
        3
      </Button>
      <Button variant="outline" size="icon" className="rounded-full bg-transparent">
        4
      </Button>
      <Button variant="outline" size="icon" className="rounded-full bg-transparent">
        5
      </Button>

      <span className="px-2 text-muted-foreground">...</span>

      <Button variant="outline" size="icon" className="rounded-full bg-transparent">
        15
      </Button>

      <Button variant="default" size="icon" className="rounded-full">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

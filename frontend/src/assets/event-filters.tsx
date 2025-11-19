"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, Calendar, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function EventFilters() {
  const [activeFilter, setActiveFilter] = useState("all")

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">Home / Dashboard</div>

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            onClick={() => setActiveFilter("all")}
            className="rounded-full"
          >
            All
          </Button>
          <Button
            variant={activeFilter === "virtual" ? "default" : "outline"}
            onClick={() => setActiveFilter("virtual")}
            className="rounded-full"
          >
            Virtual
          </Button>
          <Button
            variant={activeFilter === "in-person" ? "default" : "outline"}
            onClick={() => setActiveFilter("in-person")}
            className="rounded-full"
          >
            In Person
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search" className="pl-10 rounded-full bg-card" />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>

            <Button variant="outline" className="rounded-full gap-2 bg-transparent">
              <Calendar className="h-4 w-4" />
              Date
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full gap-2 bg-transparent">
                  All Categories
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>All Categories</DropdownMenuItem>
                <DropdownMenuItem>Hackathon</DropdownMenuItem>
                <DropdownMenuItem>Conference</DropdownMenuItem>
                <DropdownMenuItem>Seminar</DropdownMenuItem>
                <DropdownMenuItem>Culture Event</DropdownMenuItem>
                <DropdownMenuItem>Workshop</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}

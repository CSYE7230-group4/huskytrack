"use client"

import { useState } from "react"
import { Search, Calendar, MapPin, Users, Bookmark, CheckCircle2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MiniCalendar } from "@/components/mini-calendar"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

type EventCategory = "All" | "Academic" | "Career" | "Clubs" | "Sports"

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  category: EventCategory
  description: string
  isBookmarked?: boolean
  isRSVPed?: boolean
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Computer Science Career Fair",
    date: "2025-01-15",
    time: "10:00 AM - 4:00 PM",
    location: "Curry Student Center",
    category: "Career",
    description: "Meet with top tech companies and explore internship opportunities",
  },
  {
    id: "2",
    title: "Machine Learning Workshop",
    date: "2025-01-15",
    time: "2:00 PM - 4:00 PM",
    location: "West Village H, Room 210",
    category: "Academic",
    description: "Hands-on workshop covering neural networks and deep learning",
  },
  {
    id: "3",
    title: "Huskies vs. Boston College",
    date: "2025-01-16",
    time: "7:00 PM - 9:00 PM",
    location: "Matthews Arena",
    category: "Sports",
    description: "Men's hockey game - show your Husky pride!",
  },
  {
    id: "4",
    title: "Entrepreneurship Club Meeting",
    date: "2025-01-16",
    time: "6:00 PM - 7:30 PM",
    location: "Interdisciplinary Science & Engineering Complex",
    category: "Clubs",
    description: "Monthly meeting with guest speaker from local startup",
  },
  {
    id: "5",
    title: "Research Symposium",
    date: "2025-01-17",
    time: "9:00 AM - 5:00 PM",
    location: "Ell Hall",
    category: "Academic",
    description: "Annual undergraduate research showcase",
  },
  {
    id: "6",
    title: "Women in Tech Panel",
    date: "2025-01-17",
    time: "5:00 PM - 6:30 PM",
    location: "Snell Library, Room 145",
    category: "Career",
    description: "Panel discussion with female leaders in technology",
  },
]

const categories: EventCategory[] = ["All", "Academic", "Career", "Clubs", "Sports"]

export function EventTracker() {
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [events, setEvents] = useState(mockEvents)
  const router = useRouter()

  const filteredEvents = events.filter((event) => {
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleBookmark = (eventId: string) => {
    setEvents(events.map((event) => (event.id === eventId ? { ...event, isBookmarked: !event.isBookmarked } : event)))
  }

  const toggleRSVP = (eventId: string) => {
    setEvents(events.map((event) => (event.id === eventId ? { ...event, isRSVPed: !event.isRSVPed } : event)))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Northeastern Events</h1>
            </div>
          </div>

          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              My Events
            </Button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="px-6 pb-4 flex gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "rounded-full",
                selectedCategory === category && "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {category}
            </Button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar - Mini Calendar */}
        <aside className="w-80 border-r border-border bg-card p-6 sticky top-[137px] h-[calc(100vh-137px)] overflow-y-auto">
          <MiniCalendar />

          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Events</span>
                <span className="font-medium text-foreground">{filteredEvents.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">My RSVPs</span>
                <span className="font-medium text-primary">{events.filter((e) => e.isRSVPed).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bookmarked</span>
                <span className="font-medium text-foreground">{events.filter((e) => e.isBookmarked).length}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Event List */}
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-1">
                {selectedCategory === "All" ? "All Events" : `${selectedCategory} Events`}
              </h2>
              <p className="text-muted-foreground">
                {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} found
              </p>
            </div>

            <div className="grid gap-4">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-16 text-center pt-1">
                          <div className="text-xs font-medium text-muted-foreground uppercase">
                            {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                          </div>
                          <div className="text-2xl font-bold text-foreground">{new Date(event.date).getDate()}</div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                event.category === "Academic" && "bg-blue-100 text-blue-700",
                                event.category === "Career" && "bg-green-100 text-green-700",
                                event.category === "Clubs" && "bg-purple-100 text-purple-700",
                                event.category === "Sports" && "bg-primary/10 text-primary",
                              )}
                            >
                              {event.category}
                            </span>
                          </div>

                          <div className="space-y-1 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          </div>

                          <p className="text-sm text-foreground">{event.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant={event.isRSVPed ? "default" : "outline"}
                        onClick={() => toggleRSVP(event.id)}
                        className={cn("w-24", event.isRSVPed && "bg-primary hover:bg-primary/90")}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        {event.isRSVPed ? "RSVP'd" : "RSVP"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleBookmark(event.id)} className="w-24">
                        <Bookmark className={cn("w-4 h-4 mr-1", event.isBookmarked && "fill-current")} />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => router.push("/comments")} className="w-24">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Comments
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium text-foreground mb-1">No events found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

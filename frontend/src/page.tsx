import Link from "next/link"
import { LandingHeader } from "@/components/landing-header"
import { DateSelector } from "@/components/date-selector"
import { EventCard } from "@/components/event-card"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

const featuredEvents = [
  {
    image: "/business-seminar-presentation.jpg",
    category: "WORKSHOP",
    categoryColor: "bg-indigo-600",
    date: "Tuesday, Oct 14, 2025",
    time: "12pm to 1pm EST",
    title: "AI Workshop",
    description:
      "Build AI tools into existing multi-layer sports models. Learn how to get into AI in a more higher position. No code needed!",
    location: "East Village, 7th Floor Conference Facility",
    price: "Free",
  },
  {
    image: "/conference-presentation-audience.jpg",
    category: "SEMINAR",
    categoryColor: "bg-blue-500",
    date: "Tuesday, Oct 14, 2025",
    time: "7 pm to 9 pm EST",
    title: "Cloud Conference",
    description:
      "Build AI tools into existing multi-layer sports models. Learn how to get into AI in a more higher position. No code needed!",
    location: "East Village, 7th Floor Conference Facility",
    price: "Free",
  },
  {
    image: "/hackathon-coding-event.jpg",
    category: "HACKATHON",
    categoryColor: "bg-blue-600",
    date: "Tue 14 Oct, 2025",
    time: "12pm to 1pm EST",
    title: "Husky Code Hackathon",
    description:
      "Build AI tools into existing multi-layer sports models. Learn how to get into AI in a more higher position. No code needed!",
    location: "East Village, 7th Floor Conference Facility",
    price: "Free",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/campus-event-venue.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-primary/40" />
        </div>

        <div className="relative z-10 text-center text-white px-6">
          <p className="text-xl md:text-2xl font-light mb-2">One Stop</p>
          <p className="text-2xl md:text-3xl font-light mb-4">For</p>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Campus Events</h1>
          <p className="text-sm md:text-base tracking-[0.3em] uppercase mb-8">Making Every Husky Moment Count</p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-12 py-6 text-lg rounded-full">
              Explore
            </Button>
          </Link>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Upcoming Events</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Latest <span className="text-primary">Awesome Events</span>
            </h2>
          </div>

          <div className="mb-12">
            <DateSelector />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event, index) => (
              <EventCard key={index} {...event} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

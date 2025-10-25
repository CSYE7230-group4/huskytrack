import { Header } from "@/components/header"
import { EventFilters } from "@/components/event-filters"
import { EventCard } from "@/components/event-card"
import { Pagination } from "@/components/pagination"
import { Footer } from "@/components/footer"

const events = [
  {
    image: "/hackathon-coding-event.jpg",
    category: "HACKATHON",
    categoryColor: "bg-blue-600",
    date: "Tuesday, Oct 14, 2025",
    time: "12pm to 1pm EST",
    title: "Husky Coding Hackathon",
    description:
      "Collaborate with fellow Huskies to design AI-powered campus solutions. Code, compete, and innovate your way to victory.",
    location: "East Wing, 7th Floor Conflict at Facility",
    price: "Free",
  },
  {
    image: "/conference-presentation-audience.jpg",
    category: "CONFERENCE",
    categoryColor: "bg-purple-600",
    date: "Wednesday, Oct 15, 2025",
    time: "10 am to 4 pm EST",
    title: "Future of AI Conference 2025",
    description:
      "A full-day conference featuring keynote talks on ethical AI, machine learning, and digital implications across industries.",
    location: "SEC Auditorium",
    price: "Free",
  },
  {
    image: "/seminar-tech-presentation.jpg",
    category: "SEMINAR",
    categoryColor: "bg-blue-500",
    date: "Thursday, Oct 16, 2025",
    time: "12pm to 2 pm EST",
    title: "Generative AI in Tech Seminar",
    description: "Explore novel and generative design are reshaping the industry of information technology.",
    location: "Snell Library Room 90",
    price: "Free",
  },
  {
    image: "/diwali-celebration-lights.jpg",
    category: "CULTURE EVENT",
    categoryColor: "bg-orange-600",
    date: "Friday, Oct 17, 2025",
    time: "6 pm to 9 pm EST",
    title: "Diwali Night @ Northeastern",
    description:
      "Join us in celebrating Diwali with traditional music and dance performances. The entire campus lights up with color, culture, and community spirit.",
    location: "Krentzman Quad",
    price: "Free",
  },
  {
    image: "/automation-workshop-laptop.jpg",
    category: "WORKSHOP",
    categoryColor: "bg-indigo-600",
    date: "Tuesday, Oct 14, 2025",
    time: "12pm to 1pm EST",
    title: "No Code Automation",
    description: "Hands-on workshop on building smart workflows using no-code and Zapier. No programming required!",
    location: "ISEC Room 140",
    price: "Free",
  },
  {
    image: "/business-seminar-presentation.jpg",
    category: "SEMINAR",
    categoryColor: "bg-blue-500",
    date: "Tuesday, Oct 21, 2025",
    time: "7 pm to 9 pm EST",
    title: "AI in Business Transformation",
    description:
      "Discover how AI-driven automation is reshaping business strategy for decision-making and efficiency across global industries.",
    location: "EXP Room 210",
    price: "Free",
  },
  {
    image: "/cultural-dance-performance.jpg",
    category: "CULTURE EVENT",
    categoryColor: "bg-orange-600",
    date: "Thursday, Oct 23, 2025",
    time: "5 pm to 7 pm EST",
    title: "Rhythms of the World",
    description:
      "Experience a modern and joyful evening of traditional and modern dance performances representing cultures from around the globe.",
    location: "Blackman Auditorium",
    price: "Free",
  },
  {
    image: "/engineering-workshop-collaboration.jpg",
    category: "WORKSHOP",
    categoryColor: "bg-indigo-600",
    date: "Tuesday, Oct 28, 2025",
    time: "1 pm to 3 pm EST",
    title: "Prompt Engineering Workshop",
    description:
      "Master the art of crafting AI prompts for models like ChatGPT and Claude. Learn prompt tuning, context design, and advanced response control.",
    location: "ISEC Room 145",
    price: "Free",
  },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-6 py-8">
          <EventFilters />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {events.map((event, index) => (
              <EventCard key={index} {...event} />
            ))}
          </div>

          <Pagination />
        </div>
      </main>

      <Footer />
    </div>
  )
}

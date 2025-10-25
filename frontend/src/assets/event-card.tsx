import { MapPin, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface EventCardProps {
  image: string
  category: string
  categoryColor: string
  date: string
  time: string
  title: string
  description: string
  location: string
  price: string
}

export function EventCard({
  image,
  category,
  categoryColor,
  date,
  time,
  title,
  description,
  location,
  price,
}: EventCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <img src={image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
        <Badge className={`absolute top-3 right-3 ${categoryColor} text-white border-0`}>{category}</Badge>
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{date}</span>
          <span>•</span>
          <span>{time}</span>
        </div>

        <h3 className="font-semibold text-lg leading-tight">{title}</h3>

        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>

        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{price}</span>
        </div>
      </CardContent>
    </Card>
  )
}

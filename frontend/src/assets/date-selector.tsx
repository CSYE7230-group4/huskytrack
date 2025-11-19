"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface DateOption {
  date: number
  day: string
}

const dates: DateOption[] = [
  { date: 13, day: "MON" },
  { date: 14, day: "TUE" },
  { date: 15, day: "WED" },
  { date: 16, day: "THU" },
  { date: 17, day: "FRI" },
]

export function DateSelector() {
  const [selectedDate, setSelectedDate] = useState(13)

  return (
    <div className="flex justify-center gap-4">
      {dates.map((dateOption) => (
        <Button
          key={dateOption.date}
          variant={selectedDate === dateOption.date ? "default" : "outline"}
          className={`flex h-auto flex-col items-center gap-1 px-8 py-4 ${
            selectedDate === dateOption.date
              ? "bg-muted text-foreground hover:bg-muted/90"
              : "border-border hover:bg-muted/50"
          }`}
          onClick={() => setSelectedDate(dateOption.date)}
        >
          <span className="text-2xl font-bold">{dateOption.date}</span>
          <span className="text-xs font-medium uppercase tracking-wider">{dateOption.day}</span>
        </Button>
      ))}
    </div>
  )
}

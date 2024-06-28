
'use client';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState } from "react";

export default function Plan() {
    const [duration, setDuration] = useState(60)
    const [events, setEvents] = useState([{ name: "Meeting", start: "2023-06-28T10:00", end: "2023-06-28T11:00" }])
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          Plan Event
          <CalendarIcon className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 space-y-4">
      <div className="grid gap-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Slider
              id="duration"
              min={15}
              max={240}
              step={15}
              value={[duration]}
              onValueChange={setDuration}
              className="w-full"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{duration} minutes</span>
              <Button
                variant="outline"
                onClick={() => {
                  const newEvent = {
                    name: "New Event",
                    start: new Date().toISOString().slice(0, 16),
                    end: new Date(new Date().getTime() + duration * 60000).toISOString().slice(0, 16),
                  }
                  setEvents([...events, newEvent])
                }}
              >
                Plan
              </Button>
            </div>
          </div>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <Label htmlFor="eventName">Event Name</Label>
              <Input id="eventName" placeholder="Event Name" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="startTime">Start Time</Label>
              <Popover>
                    <input
                        id="start-date"
                        name="date"
                        type="datetime-local"
                        className="peer block w-full rounded-md border border-gray-200 p-2 text-sm outline-2 placeholder:text-gray-500"
                        aria-describedby="date-error"
                    />
              </Popover>
            </div>
            <div className="space-y-1">
              <Label htmlFor="endTime">End Time</Label>
              <Popover>
                     <input
                        id="end-date"
                        name="date"
                        type="datetime-local"
                        className="peer block w-full rounded-md border border-gray-200 p-2 text-sm outline-2 placeholder:text-gray-500"
                        aria-describedby="date-error"
                    />
              </Popover>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function CalendarIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}


function ClockIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}


function PlusIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
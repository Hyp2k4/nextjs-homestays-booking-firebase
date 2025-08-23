"use client"

import * as React from "react"

interface TimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
}

export function TimePicker({ date, setDate }: TimePickerProps) {
  const [period, setPeriod] = React.useState<"AM" | "PM">(
    date && date.getHours() >= 12 ? "PM" : "AM"
  )

  const currentHour = date
    ? date.getHours() % 12 === 0
      ? 12
      : date.getHours() % 12
    : 12
  const currentMinute = date?.getMinutes() ?? 0

  const updateTime = (hour: number, minute: number, newPeriod = period) => {
    const newDate = date ? new Date(date) : new Date()
    let h = hour
    if (newPeriod === "PM" && h < 12) h += 12
    if (newPeriod === "AM" && h === 12) h = 0
    newDate.setHours(h)
    newDate.setMinutes(minute)
    setDate(newDate)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Hour select */}
      <select
        value={currentHour}
        onChange={(e) => updateTime(parseInt(e.target.value), currentMinute)}
        className="p-2 rounded-md border shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
      >
        {Array.from({ length: 12 }, (_, i) => {
          const h = i + 1
          return (
            <option key={h} value={h}>
              {h.toString().padStart(2, "0")}
            </option>
          )
        })}
      </select>

      <span className="font-semibold">:</span>

      {/* Minute select */}
      <select
        value={currentMinute}
        onChange={(e) => updateTime(currentHour, parseInt(e.target.value))}
        className="p-2 rounded-md border shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
      >
        {Array.from({ length: 60 }, (_, i) => (
          <option key={i} value={i}>
            {i.toString().padStart(2, "0")}
          </option>
        ))}
      </select>

      {/* AM/PM buttons */}
      <div className="flex gap-2">
        {["AM", "PM"].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setPeriod(p as "AM" | "PM")
              updateTime(currentHour, currentMinute, p as "AM" | "PM")
            }}
            className={`px-3 py-2 rounded-md border transition ${
              period === p
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}

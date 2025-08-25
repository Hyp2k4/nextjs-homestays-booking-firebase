"use client"

import React, { useState, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DateTimeRangePickerProps {
  checkIn?: Date
  checkOut?: Date
  onChange: (dates: { checkIn: Date | undefined; checkOut: Date | undefined }) => void
  minDate?: Date
}

export function DateTimeRangePicker({
  checkIn,
  checkOut,
  onChange,
  minDate = new Date()
}: DateTimeRangePickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [mode, setMode] = useState<'date' | 'time'>('date')
  const [tempTime, setTempTime] = useState({ hours: 14, minutes: 0 })

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ]

  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Previous month's days
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1)
      days.push({ date: prevDate, isCurrentMonth: false })
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }

    // Next month's days to fill the grid
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i)
      days.push({ date: nextDate, isCurrentMonth: false })
    }

    return days
  }

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    return compareDate < today
  }

  const isDateInRange = (date: Date) => {
    if (!checkIn || !checkOut) return false
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    const checkInDate = new Date(checkIn)
    checkInDate.setHours(0, 0, 0, 0)
    const checkOutDate = new Date(checkOut)
    checkOutDate.setHours(0, 0, 0, 0)
    return compareDate > checkInDate && compareDate < checkOutDate
  }

  const isDateSelected = (date: Date) => {
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)

    if (checkIn) {
      const checkInDate = new Date(checkIn)
      checkInDate.setHours(0, 0, 0, 0)
      if (compareDate.getTime() === checkInDate.getTime()) return 'checkin'
    }

    if (checkOut) {
      const checkOutDate = new Date(checkOut)
      checkOutDate.setHours(0, 0, 0, 0)
      if (compareDate.getTime() === checkOutDate.getTime()) return 'checkout'
    }

    return false
  }

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return

    setSelectedDate(date)
    setMode('time')

    // Set default time based on whether we're setting check-in or check-out
    if (!checkIn) {
      setTempTime({ hours: 14, minutes: 0 }) // Check-in default: 2:00 PM
    } else {
      setTempTime({ hours: 12, minutes: 0 }) // Check-out default: 12:00 PM
    }
  }

  const handleTimeConfirm = () => {
    if (!selectedDate) return

    const newDateTime = new Date(selectedDate)
    newDateTime.setHours(tempTime.hours, tempTime.minutes, 0, 0)

    if (!checkIn) {
      // Setting check-in
      onChange({ checkIn: newDateTime, checkOut: undefined })
    } else if (!checkOut) {
      // Setting check-out
      if (newDateTime > checkIn) {
        onChange({ checkIn, checkOut: newDateTime })
      } else {
        // If check-out is before check-in, swap them
        onChange({ checkIn: newDateTime, checkOut: checkIn })
      }
    } else {
      // Both dates are set, update the closer one
      const checkInDiff = Math.abs(newDateTime.getTime() - checkIn.getTime())
      const checkOutDiff = Math.abs(newDateTime.getTime() - checkOut.getTime())

      if (checkInDiff < checkOutDiff) {
        // Update check-in
        if (newDateTime < checkOut) {
          onChange({ checkIn: newDateTime, checkOut })
        } else {
          onChange({ checkIn: checkOut, checkOut: newDateTime })
        }
      } else {
        // Update check-out
        if (newDateTime > checkIn) {
          onChange({ checkIn, checkOut: newDateTime })
        } else {
          onChange({ checkIn: newDateTime, checkOut: checkIn })
        }
      }
    }

    setMode('date')
    setSelectedDate(null)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const formatTime = (hours: number, minutes: number) => {
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (mode === 'time' && selectedDate) {
    return (
      <Card className="w-full max-w-[340px] mx-auto">
        <CardContent className="p-4 sm:p-6">
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="font-semibold text-sm sm:text-lg mb-2">
              {!checkIn ? 'Chọn giờ nhận phòng' : 'Chọn giờ trả phòng'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {selectedDate.toLocaleDateString('vi-VN', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Time Display */}
            <div className="text-center py-2 sm:py-4">
              <div className="text-xl sm:text-3xl font-mono font-bold">
                {formatTime(tempTime.hours, tempTime.minutes)}
              </div>
            </div>

            {/* Hours */}
            <div>
              <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Giờ</label>
              <div className="grid grid-cols-4 gap-1 sm:gap-2">
                {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(hour => (
                  <Button
                    key={hour}
                    variant={tempTime.hours === hour ? "default" : "outline"}
                    size="sm"
                    className="h-7 sm:h-8 text-xs"
                    onClick={() => setTempTime(prev => ({ ...prev, hours: hour }))}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div>
              <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Phút</label>
              <div className="grid grid-cols-4 gap-1 sm:gap-2">
                {[0, 15, 30, 45].map(minute => (
                  <Button
                    key={minute}
                    variant={tempTime.minutes === minute ? "default" : "outline"}
                    size="sm"
                    className="h-7 sm:h-8 text-xs"
                    onClick={() => setTempTime(prev => ({ ...prev, minutes: minute }))}
                  >
                    {minute.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1 sm:gap-2 pt-2 sm:pt-4">
              <Button
                variant="outline"
                className="flex-1 text-xs sm:text-sm"
                onClick={() => {
                  setMode('date')
                  setSelectedDate(null)
                }}
              >
                Quay lại
              </Button>
              <Button
                className="flex-1 text-xs sm:text-sm"
                onClick={handleTimeConfirm}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-[340px] mx-auto">
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold text-sm sm:text-lg text-center min-w-[120px]">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected Dates Info */}
        <div className="mb-4 sm:mb-6 space-y-1 sm:space-y-2 text-xs sm:text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">Nhận phòng:</span>
            <span className={cn(
              "text-right max-w-[140px] truncate",
              checkIn ? "text-foreground" : "text-muted-foreground"
            )}>
              {checkIn ? formatDateDisplay(checkIn) : 'Chọn ngày'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Trả phòng:</span>
            <span className={cn(
              "text-right max-w-[140px] truncate",
              checkOut ? "text-foreground" : "text-muted-foreground"
            )}>
              {checkOut ? formatDateDisplay(checkOut) : 'Chọn ngày'}
            </span>
          </div>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 mb-1 sm:mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-1 sm:py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {getDaysInMonth(currentDate).map((day, index) => {
            const isDisabled = isDateDisabled(day.date)
            const isSelected = isDateSelected(day.date)
            const isInRange = isDateInRange(day.date)

            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 font-normal text-xs sm:text-sm",
                  !day.isCurrentMonth && "text-muted-foreground opacity-50",
                  isDisabled && "opacity-30 cursor-not-allowed",
                  isSelected === 'checkin' && "bg-primary text-primary-foreground hover:bg-primary",
                  isSelected === 'checkout' && "bg-primary text-primary-foreground hover:bg-primary",
                  isInRange && !isSelected && "bg-primary/20",
                  !isDisabled && day.isCurrentMonth && "hover:bg-accent"
                )}
                onClick={() => handleDateClick(day.date)}
                disabled={isDisabled}
              >
                {day.date.getDate()}
              </Button>
            )
          })}
        </div>

        {/* Clear Button */}
        {(checkIn || checkOut) && (
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs sm:text-sm"
              onClick={() => onChange({ checkIn: undefined, checkOut: undefined })}
            >
              <X className="h-4 w-4 mr-1" />
              Xóa lựa chọn
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
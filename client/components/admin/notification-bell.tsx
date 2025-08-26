"use client"

import { useState, useEffect } from "react"
import { Bell, X, Check, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationService, type Notification } from "@/lib/notification-service"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Subscribe to admin notifications
    const unsubscribe = NotificationService.subscribeToRoleNotifications("admin", (notifs) => {
      setNotifications(notifs)
    })

    return () => unsubscribe()
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId)
      toast.success("Notification marked as read")
    } catch (error) {
      toast.error("Failed to mark notification as read")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
      if (unreadIds.length > 0) {
        await NotificationService.markMultipleAsRead(unreadIds)
        toast.success("All notifications marked as read")
      }
    } catch (error) {
      toast.error("Failed to mark notifications as read")
    }
  }

  const getNotificationIcon = (type: string, priority?: string) => {
    switch (type) {
      case "booking":
        return priority === "high" ? "🔥" : "📅"
      case "review":
        return "⭐"
      case "homestay":
        return "🏠"
      case "user":
        return "👤"
      case "payment":
        return "💳"
      case "message":
        return "💬"
      case "voucher":
        return "🎟️"
      case "host_action":
        return "🏡"
      case "system":
        return "⚙️"
      default:
        return "🔔"
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500 bg-red-50"
      case "high":
        return "border-l-orange-500 bg-orange-50"
      case "medium":
        return "border-l-blue-500 bg-blue-50"
      default:
        return "border-l-neutral-300"
    }
  }

  const formatTimeAgo = (date: any) => {
    const now = new Date()
    const notificationDate = date?.toDate ? date.toDate() : new Date(date)
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="border-b border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-neutral-600 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-neutral-50 transition-colors cursor-pointer border-l-4",
                    !notification.read && getPriorityColor(notification.priority),
                    notification.read && "border-l-neutral-200"
                  )}
                  onClick={() => {
                    if (!notification.read) handleMarkAsRead(notification.id)
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-lg">{getNotificationIcon(notification.type, notification.priority)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            notification.read ? "text-neutral-700" : "text-neutral-900"
                          )}>
                            {notification.title}
                          </p>
                          {notification.priority === "urgent" && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Urgent
                            </span>
                          )}
                          {notification.priority === "high" && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              High
                            </span>
                          )}
                        </div>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notification.id)
                            }}
                            className="h-6 w-6 p-0 ml-2"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className={cn(
                        "text-sm mt-1",
                        notification.read ? "text-neutral-500" : "text-neutral-700"
                      )}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {notifications.length > 10 && (
          <div className="border-t border-neutral-200 p-3">
            <Button variant="ghost" size="sm" className="w-full text-sm">
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { chatService } from "@/lib/chat-service"
import type { Chat } from "@/types/chat"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, X, ArrowLeft } from "lucide-react"
import { ChatList } from "./chat-list"
import { ChatWindow } from "./chat-window"

export function GlobalChatWidget() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<Chat | null>(null)

  useEffect(() => {
    if (!user) return

    const unsubscribe = chatService.subscribeToUserChats(user.id, setChats)
    return () => unsubscribe()
  }, [user])

  const totalUnreadCount = chats.reduce((acc, chat) => {
    const unread = chat.unreadCount && user ? chat.unreadCount[user.id] || 0 : 0
    return acc + unread
  }, 0)

  if (!user) {
    return null
  }

  const handleChatSelect = (chat: Chat) => {
    setActiveChat(chat)
  }

  const handleBackToList = () => {
    setActiveChat(null)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-96 h-[600px] flex flex-col shadow-2xl rounded-xl bg-background border relative">
          {/* Nút X để đóng popup */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </button>

          {activeChat ? (
            <ChatWindow chat={activeChat} onBack={handleBackToList} />
          ) : (
            <ChatList onChatSelect={handleChatSelect} />
          )}
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-16 w-16 shadow-lg relative"
        >
          <MessageSquare className="h-8 w-8" />
          {totalUnreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center text-xs"
            >
              {totalUnreadCount}
            </Badge>
          )}
        </Button>
      )}

    </div>
  )
}

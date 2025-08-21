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
    if (user?.role !== "host") return

    const unsubscribe = chatService.subscribeToUserChats(user.id, setChats)
    return () => unsubscribe()
  }, [user])

  const totalUnreadCount = chats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0)

  if (user?.role !== "host") {
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
        <Card className="w-96 h-[600px] flex flex-col shadow-2xl rounded-xl bg-background border">
          {activeChat ? (
            <ChatWindow chat={activeChat} onClose={handleBackToList} />
          ) : (
            <>
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">Tin nhắn</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ChatList onChatSelect={handleChatSelect} />
            </>
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
              className="absolute -top-1 -right-1 rounded-full p-1 h-6 w-6 flex items-center justify-center"
            >
              {totalUnreadCount}
            </Badge>
          )}
        </Button>
      )}
    </div>
  )
}

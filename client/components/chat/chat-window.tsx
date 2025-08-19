"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { Chat, Message } from "@/types/chat"
import { chatService } from "@/lib/chat-service"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface ChatWindowProps {
  chat: Chat
}

export function ChatWindow({ chat }: ChatWindowProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chat) return

    const chatMessages = chatService.getChatMessages(chat.id)
    setMessages(chatMessages)

    // Mark as read
    if (user) {
      chatService.markAsRead(chat.id, user.id)
    }

    const unsubscribe = chatService.subscribe(() => {
      const updatedMessages = chatService.getChatMessages(chat.id)
      setMessages(updatedMessages)
    })

    return unsubscribe
  }, [chat, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || isLoading) return

    setIsLoading(true)
    const senderType = user.role === "host" ? "host" : "guest"

    chatService.sendMessage(chat.id, user.id, user.name, senderType, newMessage.trim())

    setNewMessage("")
    setIsLoading(false)
  }

  if (!user) return null

  const isHost = user.role === "host"
  const otherPartyName = isHost ? "Khách hàng" : "Chủ nhà"

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-emerald-100 text-emerald-700">{otherPartyName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{otherPartyName}</h3>
            <p className="text-sm text-gray-600">{chat.propertyName}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.senderId === user.id

          return (
            <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${isOwnMessage ? "text-emerald-100" : "text-gray-500"}`}>
                  {format(new Date(message.timestamp), "HH:mm", { locale: vi })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isLoading}
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

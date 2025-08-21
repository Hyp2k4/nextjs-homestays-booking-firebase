"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { Chat, Message } from "@/types/chat"
import { chatService } from "@/lib/chat-service"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, ArrowLeft, Paperclip } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import Image from "next/image"

interface ChatWindowProps {
  chat: Chat
  onBack: () => void
}

export function ChatWindow({ chat, onBack }: ChatWindowProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!chat?.id) return

    setIsLoading(true)
    const unsubscribe = chatService.subscribeToChatMessages(chat.id, (updatedMessages) => {
      setMessages(updatedMessages)
      setIsLoading(false)
      if (user) {
        chatService.markAsRead(chat.id, user.id)
      }
    })

    return () => unsubscribe()
  }, [chat?.id, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newMessage.trim() && !imageFile) || !user) return

    const senderType = user.role === "host" ? "host" : "guest"
    const currentMessage = newMessage.trim()
    const currentImageFile = imageFile

    setNewMessage("")
    setImageFile(null)

    await chatService.sendMessage(
      chat.id,
      user.id,
      user.name || "User",
      senderType,
      currentMessage,
      currentImageFile || undefined,
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  if (!user) return null

  const otherParticipantId = chat.participants.find((p) => p !== user.id)
  const otherParticipant = otherParticipantId ? chat.participantDetails[otherParticipantId] : null

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-3 border-b flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="w-10 h-10">
          <AvatarImage src={otherParticipant?.avatar} />
          <AvatarFallback>{otherParticipant?.name?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-sm">{otherParticipant?.name || "User"}</h3>
          <p className="text-xs text-gray-500">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {isLoading ? (
          <div className="text-center text-sm text-gray-500">Loading messages...</div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === user.id

            return (
              <div key={message.id} className={`flex items-end gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg ${
                    isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.type === "image" && message.imageUrl ? (
                    <Image src={message.imageUrl} alt="Sent image" width={200} height={200} className="rounded-md" />
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  <p className={`text-xs mt-1 text-right ${isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground/70"}`}>
                    {format(new Date(message.timestamp), "HH:mm")}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-2 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
          <Button type="button" variant="ghost" size="icon" onClick={handleAttachmentClick}>
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1"
            autoComplete="off"
          />
          {imageFile && <p className="text-sm text-gray-500 truncate max-w-[100px]">{imageFile.name}</p>}
          <Button type="submit" disabled={!newMessage.trim() && !imageFile} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

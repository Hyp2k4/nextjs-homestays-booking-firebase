"use client"

import { useState, useEffect } from "react"
import type { Chat } from "@/types/chat"
import { chatService } from "@/lib/chat-service"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

interface ChatListProps {
  onChatSelect: (chat: Chat) => void
  selectedChatId?: string
}

export function ChatList({ onChatSelect, selectedChatId }: ChatListProps) {
  const { user } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])

  useEffect(() => {
    if (!user) return

    const unsubscribe = chatService.subscribeToUserChats(user.id, (updatedChats) => {
      const sortedChats = updatedChats.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      )
      setChats(sortedChats)
    })

    return () => unsubscribe()
  }, [user])

  if (!user) return null

  const toDate = (timestamp: any): Date => {
    if (timestamp?.toDate) {
      return timestamp.toDate()
    }
    return new Date(timestamp)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Tin nhắn</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>Chưa có tin nhắn nào</p>
          </div>
        ) : (
          <div className="divide-y">
            {chats.map((chat) => {
              const otherParticipantId = chat.participants.find((p) => p !== user.id)
              const otherParticipant = otherParticipantId
                ? chat.participantDetails[otherParticipantId]
                : null
              const isSelected = selectedChatId === chat.id

              return (
                <div
                  key={chat.id}
                  onClick={() => onChatSelect(chat)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? "bg-emerald-50 border-r-2 border-emerald-500" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={otherParticipant?.avatar} />
                      <AvatarFallback>
                        {otherParticipant?.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm truncate">{otherParticipant?.name || "User"}</h3>
                          {chat.unreadCount && user && chat.unreadCount[user.id] > 0 && (
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                        </div>
                        {chat.unreadCount && chat.unreadCount > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            {chat.unreadCount}
                          </Badge>
                        ) : null}
                      </div>

                      <p className="text-xs text-gray-600 mb-1 truncate">{chat.propertyName}</p>

                      {chat.lastMessage && (
                        <>
                          <p className="text-sm text-gray-700 truncate mb-1">{chat.lastMessage.content}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(toDate(chat.lastMessage.timestamp), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

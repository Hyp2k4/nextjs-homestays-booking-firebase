"use client"

import { useState } from "react"
import type { Chat } from "@/types/chat"
import { ChatList } from "@/components/chat/chat-list"
import { ChatWindow } from "@/components/chat/chat-window"
import { useAuth } from "@/contexts/auth-context"
import { MessageCircle } from "lucide-react"

export default function MessagesPage() {
  const { user } = useAuth()
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Đăng nhập để xem tin nhắn</h2>
          <p className="text-gray-600">Bạn cần đăng nhập để truy cập tính năng tin nhắn</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-sm">
          <div className="px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Tin nhắn</h1>
            <p className="text-gray-600 mt-1">Liên lạc với {user.role === "host" ? "khách hàng" : "chủ nhà"} của bạn</p>
          </div>
        </div>

        <div className="flex h-[calc(100vh-200px)]">
          {/* Chat List */}
          <div className="w-1/3 bg-white border-r">
            <ChatList onChatSelect={setSelectedChat} selectedChatId={selectedChat?.id} />
          </div>

          {/* Chat Window */}
          <div className="flex-1 bg-white">
            {selectedChat ? (
              <ChatWindow chat={selectedChat} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chọn một cuộc trò chuyện</h3>
                  <p className="text-gray-600">Chọn một cuộc trò chuyện từ danh sách để bắt đầu nhắn tin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

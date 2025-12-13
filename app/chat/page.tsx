
'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useAuth } from '@/utils/useAuth'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface ChatMessage {
  _id: string
  senderId: string
  senderName: string
  message: string
  createdAt: string
}

interface Conversation {
  userId: string
  userName: string
  lastMessage: string
  lastMessageTime: string
}

// Chat content component that uses useSearchParams
function ChatContent() {
  const { user, loading } = useAuth()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load conversations
  useEffect(() => {
    if (loading || !user) return

    const loadConversations = async () => {
      try {
        setLoadingConversations(true)
        // For now, create conversations from contacts
        // In a real app, you'd fetch this from API
        setConversations([
          {
            userId: 'user1',
            userName: 'John Doe',
            lastMessage: 'Hi, is this item still available?',
            lastMessageTime: new Date().toISOString(),
          },
          {
            userId: 'user2',
            userName: 'Jane Smith',
            lastMessage: 'Thanks for helping!',
            lastMessageTime: new Date().toISOString(),
          },
        ])

        // Check query params for direct contact
        const userId = searchParams.get('userId')
        if (userId) {
          setSelectedUserId(userId)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoadingConversations(false)
      }
    }

    loadConversations()
  }, [user?.uid, loading])

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedUserId || !user) return

    const loadMessages = async () => {
      try {
        setLoadingMessages(true)
        setError('')

        // Simulate fetching messages from API
        // In a real app: fetch(`/api/chat?userId=${selectedUserId}`)
        const mockMessages: ChatMessage[] = [
          {
            _id: '1',
            senderId: user.uid,
            senderName: user.displayName || 'You',
            message: 'Hi! Is this item still available?',
            createdAt: new Date(Date.now() - 300000).toISOString(),
          },
          {
            _id: '2',
            senderId: selectedUserId,
            senderName: 'Contact User',
            message: 'Yes, it is! When would you like to meet?',
            createdAt: new Date(Date.now() - 180000).toISOString(),
          },
          {
            _id: '3',
            senderId: user.uid,
            senderName: user.displayName || 'You',
            message: 'How about tomorrow afternoon?',
            createdAt: new Date(Date.now() - 60000).toISOString(),
          },
        ]

        setMessages(mockMessages)
      } catch (err: any) {
        setError('Failed to load messages')
      } finally {
        setLoadingMessages(false)
      }
    }

    loadMessages()

    // Poll for new messages every 2 seconds
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
    }

    pollIntervalRef.current = setInterval(loadMessages, 2000)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [selectedUserId, user])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!messageInput.trim() || !selectedUserId || !user) {
      return
    }

    setSendingMessage(true)

    try {
      // Simulate sending message to API
      // In a real app: POST to /api/chat
      const newMessage: ChatMessage = {
        _id: Date.now().toString(),
        senderId: user.uid,
        senderName: user.displayName || 'You',
        message: messageInput,
        createdAt: new Date().toISOString(),
      }

      setMessages([...messages, newMessage])
      setMessageInput('')
    } catch (error: any) {
      setError('Failed to send message')
      console.error('Error sending message:', error)
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-primary">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access chat and connect with other users.</p>
          <Link href="/" className="text-blue-500 hover:underline font-semibold">
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-8">💬 Messages</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gradient-primary text-white">
              <h2 className="text-lg font-semibold">Conversations ({conversations.length})</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingConversations ? (
                <div className="p-4 text-center text-gray-500">
                  <p>Loading conversations...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs mt-2">Click "Contact" on items to start chatting</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.userId}
                      onClick={() => setSelectedUserId(conv.userId)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedUserId === conv.userId
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <p className="font-semibold text-sm truncate">{conv.userName}</p>
                      <p className="text-xs opacity-75 truncate mt-1">{conv.lastMessage}</p>
                      <p className="text-xs opacity-50 mt-1">
                        {new Date(conv.lastMessageTime).toLocaleTimeString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
            {selectedUserId ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary to-primary-dark text-white">
                  <h2 className="text-lg font-semibold">
                    {conversations.find((c) => c.userId === selectedUserId)?.userName || 'User'}
                  </h2>
                  <p className="text-xs opacity-75">Online</p>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-center">
                        <p className="text-lg mb-2">👋</p>
                        <p>No messages yet. Say hello!</p>
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${
                          msg.senderId === user.uid ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-3 rounded-lg shadow-sm ${
                            msg.senderId === user.uid
                              ? 'bg-primary text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-800 rounded-bl-none'
                          }`}
                        >
                          <p className="text-xs opacity-75 mb-1">{msg.senderName}</p>
                          <p className="text-sm break-words">{msg.message}</p>
                          <p className="text-xs opacity-50 mt-2">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim() || sendingMessage}
                      className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingMessage ? '⏳' : '📤'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-center text-gray-500">
                  <p className="text-3xl mb-4">💬</p>
                  <p>Select a conversation to start messaging</p>
                  <p className="text-sm mt-2 opacity-75">Or click "Contact" on any item to begin</p>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}

// Main ChatPage component with Suspense wrapper
export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}


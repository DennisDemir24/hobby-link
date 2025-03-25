"use client";

import { useEffect, useRef, useState } from "react";
import { Conversation, Message } from "@/components/message/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { sendMessage } from "@/lib/actions/conversation.action";
import { useAuth } from "@clerk/nextjs";

interface ConversationViewProps {
  conversation?: Conversation;
}

export function ConversationView({ conversation }: ConversationViewProps) {
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(conversation?.messages || []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userId } = useAuth();

  // Scroll to bottom when messages change
  /* useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]); */

  // Update messages when conversation changes
  useEffect(() => {
    if (conversation?.messages) {
      setMessages(conversation.messages);
    }
  }, [conversation]);

  // Set up SSE connection for real-time updates
  useEffect(() => {
    if (!conversation) return;

    const eventSource = new EventSource('/api/messages/sse');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message' && data.data.message.conversationId === conversation.id) {
        const newMessage = {
          ...data.data.message,
          createdAt: new Date(data.data.message.createdAt).toISOString()
        };
        setMessages(prev => [...prev, newMessage]);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };
    
    return () => {
      eventSource.close();
    };
  }, [conversation]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !conversation) return;

    try {
      const response = await sendMessage({
        conversationId: conversation.id,
        content: messageInput,
      });
      
      // Optimistically add the new message to the UI
      if (response) {
        const newMessage = {
          ...response,
          createdAt: new Date(response.createdAt).toISOString()
        };
        setMessages(prev => [...prev, newMessage]);
      }
      
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      // TODO: Show error toast
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Welcome to Messages
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Select a conversation from the list or start a new one to begin chatting
          </p>
        </div>
      </div>
    );
  }

  const getParticipantName = (message: Message) => {
    const participant = conversation.participants.find(p => p.userId === message.senderId);
    return participant?.user.name || "Unknown User";
  };

  const getParticipantAvatar = (message: Message) => {
    const participant = conversation.participants.find(p => p.userId === message.senderId);
    return participant?.user.imageUrl;
  };

  const isOwnMessage = (message: Message) => {
    return message.senderId === userId;
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Conversation Header */}
      <div className="border-b px-4 py-3 flex items-center gap-3">
        {conversation.isGroup ? (
          <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-700 font-medium">
              {getInitials(conversation.name || "Group Chat")}
            </span>
          </div>
        ) : (
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.participants[0]?.user.imageUrl} />
            <AvatarFallback className="bg-indigo-100 text-indigo-700">
              {getInitials(conversation.participants[0]?.user.name || "Unknown")}
            </AvatarFallback>
          </Avatar>
        )}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {conversation.isGroup ? conversation.name || "Group Chat" : conversation.participants[0]?.user.name || "Chat"}
          </h2>
          <p className="text-sm text-gray-500">
            {conversation.participants.length} participant{conversation.participants.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex items-start gap-3 ${
                  isOwnMessage(message) ? 'flex-row-reverse' : ''
                }`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={getParticipantAvatar(message)} />
                  <AvatarFallback className="bg-gray-100 text-gray-700">
                    {getInitials(getParticipantName(message))}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex-1 ${isOwnMessage(message) ? 'text-right' : ''}`}>
                  <div className={`flex items-baseline gap-2 ${
                    isOwnMessage(message) ? 'flex-row-reverse' : ''
                  }`}>
                    <span className="font-medium text-gray-900">
                      {getParticipantName(message)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div 
                    className={`mt-1 inline-block rounded-lg px-4 py-2 ${
                      isOwnMessage(message)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!messageInput.trim()}
            className="rounded-full bg-indigo-600 p-2 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
} 
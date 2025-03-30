"use client";

import { createContext, useState, useContext, ReactNode, useCallback, useEffect } from "react";
import config from "@/Config/ServerUrl";
import { toast } from "react-toastify";
import useAuth from "@/hooks/useAuth";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => Promise<void>;
  fetchChatHistory: () => Promise<void>;
  createNewChat: () => Promise<void>;
  editMessage: (chatId: string, messageIndex: number, newContent: string) => Promise<void>;
  isHistoryLoading: boolean;
  currentChatId: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const { token, user } = useAuth();

  const fetchChatHistory = useCallback(async () => {
    if (!token || !user?._id) {
      console.log("Cannot fetch chat - missing token or user ID", { token, user });
      return;
    }
  
    setIsHistoryLoading(true);
    setError(null);
  
    try {
      console.log("Fetching chat history for user:", user._id);
      const res = await fetch(`${config.API_URL}/chat/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      console.log("Response status:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Error response data:", errorData);
        throw new Error(errorData.error || "Failed to fetch chat history");
      }
  
      const data = await res.json();
      console.log("Chat history data:", data);
      setMessages(data.messages || []);
      setCurrentChatId(data._id || null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch history";
      console.error("Error fetching chat history:", err);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [token, user]); // Changed from user?._id to user

  useEffect(() => {
    if (token && user?._id) {
      fetchChatHistory();
    }
  }, [token, user?._id, fetchChatHistory]);

  const sendMessage = async (message: string) => {
    if (!token || !message.trim()) return;
  
    setIsLoading(true);
    setError(null);
  
    // Declare userMessage outside try block
    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };
  
    try {
      // Add user message to local state immediately
      setMessages((prev) => [...prev, userMessage]);
  
      const res = await fetch(`${config.API_URL}/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
  
      if (!res.ok) {
        throw new Error("Failed to send message");
      }
  
      const data = await res.json();
      const botReply: Message = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };
  
      setMessages((prev) => [...prev, botReply]);
  
      if (!currentChatId && data.chatId) {
        setCurrentChatId(data.chatId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
  
      // Remove the optimistic update if failed
      setMessages((prev) => prev.filter((msg) => msg.timestamp !== userMessage.timestamp));
    } finally {
      setIsLoading(false);
    }
  };
  

  const createNewChat = useCallback(async () => {
    if (!token || !user?._id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Clear local state
      setMessages([]);
      setCurrentChatId(null);
      
      toast.success("New chat created");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create new chat");
      console.error("Error creating new chat:", err);
      toast.error("Failed to create new chat");
    } finally {
      setIsLoading(false);
    }
  }, [token, user?._id]);

  const clearChat = async () => {
    if (!token || !currentChatId) {
      // If no current chat, just create a new one
      await createNewChat();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await fetch(`${config.API_URL}/chat/${currentChatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages([]);
      setCurrentChatId(null);
      toast.success("Chat cleared successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear chat");
      console.error("Error clearing chat:", err);
      toast.error("Failed to clear chat");
      await fetchChatHistory();
    } finally {
      setIsLoading(false);
    }
  };

  const editMessage = async (chatId: string, messageIndex: number, newContent: string) => {
    if (!token || !chatId || !newContent.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Optimistic update
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[messageIndex]?.role === "user") {
          newMessages[messageIndex] = {
            ...newMessages[messageIndex],
            content: newContent,
            timestamp: new Date()
          };
        }
        return newMessages;
      });

      const res = await fetch(`${config.API_URL}/chat/${chatId}/message/${messageIndex}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (!res.ok) {
        throw new Error("Failed to edit message");
      }

      await res.json();
      toast.success("Message edited successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to edit message");
      console.error("Error editing message:", err);
      toast.error("Failed to edit message");
      // Revert on failure
      await fetchChatHistory();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        error,
        sendMessage,
        clearChat,
        fetchChatHistory,
        createNewChat,
        editMessage,
        isHistoryLoading,
        currentChatId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
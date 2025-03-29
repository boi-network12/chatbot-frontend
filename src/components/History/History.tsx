"use client";

import React from "react";
import { BiHistory } from "react-icons/bi";
import { format } from "date-fns";
import { useChat } from "@/context/chatContext";

interface HistoryProps {
  isOpen: boolean;
}

const History: React.FC<HistoryProps> = ({ isOpen }) => {
  const { messages, fetchChatHistory, isHistoryLoading } = useChat();

  // Extract unique conversation starters (first user messages)
  const conversationStarters = messages.reduce((acc, message, index) => {
    if (message.role === "user" && 
        (index === 0 || messages[index - 1].role === "assistant")) {
      return [...acc, {
        content: message.content,
        timestamp: message.timestamp || new Date()
      }];
    }
    return acc;
  }, [] as Array<{ content: string; timestamp: Date }>);

  return (
    <div
      className={`fixed top-0 left-0 h-full w-[250px] bg-gray-800 text-white shadow-lg transition-transform duration-300 pt-15 z-50 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <BiHistory className="text-xl" />
          <h2 className="text-xl font-bold">History</h2>
        </div>

        {isHistoryLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : conversationStarters.length === 0 ? (
          <p className="text-gray-400 text-sm">No conversation history yet</p>
        ) : (
          <div className="space-y-2">
            {conversationStarters.map((message, index) => (
              <div 
                key={index}
                className="p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={() => fetchChatHistory()} // You might want to implement a more specific fetch
              >
                <p className="text-sm line-clamp-2">{message.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(message.timestamp), "MMM d, h:mm a")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
"use client";

import { useEffect, useRef } from "react";
import { FiUser } from "react-icons/fi";
import { BsCheck2All } from "react-icons/bs";
import { BiBot } from "react-icons/bi";
import { useChat } from "@/context/chatContext";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatDisplay() {
  const { messages, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="pt-10 w-full flex flex-col h-full overflow-hidden">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="w-full flex flex-col items-center justify-center h-full text-gray-400 py-8">
              <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
              <p className="text-center">Ask anything or try one of these prompts</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}-${message.timestamp?.getTime()}`}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-100"
                }`}
              >
                <div className="flex-shrink-0 mr-2 mt-1">
                  {message.role === "user" ? (
                    <FiUser className="text-white" />
                  ) : (
                    <BiBot className="text-green-400" />
                  )}
                </div>
                <div className="overflow-x-auto">
                  <div className="text-sm">
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </Markdown>
                  </div>
                  <div className="flex justify-end items-center mt-1 space-x-1">
                    <span className="text-xs opacity-70">
                      {message.timestamp?.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {message.role === "user" && (
                      <span className="text-xs">
                        <BsCheck2All className="text-blue-300" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-100 rounded-lg p-3 flex items-center">
                <div className="flex-shrink-0 mr-2">
                  <BiBot className="text-green-400" />
                </div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
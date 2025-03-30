"use client";

import { useEffect, useRef, useState } from "react";
import { FiUser } from "react-icons/fi";
import { BsCheck2All } from "react-icons/bs";
import { BiBot, BiEdit } from "react-icons/bi";
import { useChat } from "@/context/chatContext";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaVolumeUp } from "react-icons/fa";

// ChatDisplay.tsx

export default function ChatDisplay() {
  const { messages, isLoading, editMessage, currentChatId } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingMessage, setEditingMessage] = useState<{ index: number; content: string } | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleEditSubmit = async (index: number) => {
    if (!editingMessage || !currentChatId) return;
    
    await editMessage(currentChatId, index, editingMessage.content);
    setEditingMessage(null);
  };

  const handleTextToSpeech = (text: string) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="pt-16 w-full h-[calc(100vh-120px)] flex flex-col bg-gray-900">
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 py-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        <div className="w-full max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                <h3 className="text-2xl font-bold mb-3 tracking-wide">Start a Conversation</h3>
                <p className="text-center text-gray-500 text-lg">Ask anything or try one of these prompts</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}-${message.timestamp?.getTime()}`}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[85%] sm:max-w-[75%] md:max-w-2xl rounded-2xl p-4 shadow-md transition-all duration-200 ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                    : "bg-gradient-to-r from-gray-800 to-gray-700 text-gray-100"
                } hover:shadow-lg`}
              >
                <div className="flex-shrink-0 mr-3 mt-1">
                  {message.role === "user" ? (
                    <FiUser className="text-white text-xl" />
                  ) : (
                    <BiBot className="text-green-400 text-xl" />
                  )}
                </div>
                <div className="flex-1 overflow-x-auto">
                  {editingMessage?.index === index ? (
                    <div className="p-3 bg-gray-800 rounded-xl shadow-lg transition-all duration-200">
                      <label htmlFor={`edit-message-${index}`} className="sr-only">
                        Edit message
                      </label>
                      <textarea
                        id={`edit-message-${index}`}
                        value={editingMessage.content}
                        onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
                        className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                        placeholder="Edit your message..."
                        autoFocus
                      />
                      <div className="flex justify-end space-x-3 mt-3">
                        <button
                          onClick={() => setEditingMessage(null)}
                          className="px-3 py-1.5 text-sm font-medium text-gray-400 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditSubmit(index)}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-all duration-200"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-base leading-relaxed">
                        <Markdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </Markdown>
                      </div>
                      <div className="flex justify-end items-center mt-2 space-x-2">
                        <span className="text-xs opacity-75 font-medium">
                          {message.timestamp?.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {message.role === "user" && (
                          <BsCheck2All className="text-blue-300 text-sm" />
                        )}
                        <button
                           title="Read Aloud"
                           aria-label="Read message aloud"
                           onClick={() => handleTextToSpeech(message.content)}
                           className="text-gray-400 hover:text-white"
                        >
                          <FaVolumeUp/>
                        </button>
                      </div>
                    </>
                  )}
                </div>
                {message.role === "user" && !editingMessage && (
                  <button
                    title="Edit Message"
                    aria-label="Edit Message"
                    onClick={() => setEditingMessage({ index, content: message.content })}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    <BiEdit/>
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-2xl p-4 flex items-center shadow-md">
                <div className="flex-shrink-0 mr-3">
                  <BiBot className="text-green-400 text-xl" />
                </div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.1s]"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]"></div>
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
"use client";

import { useState, ReactElement } from "react";
import { BiArrowToTop, BiPlus } from "react-icons/bi";
import { MdOutlineSearch, MdOutlineTextFields } from "react-icons/md";
import { FaBrain } from "react-icons/fa";
import { IoMdFlash } from "react-icons/io";
import { useChat } from "@/context/chatContext";

export default function Input() {
  const [message, setMessage] = useState("");
  const { sendMessage, isLoading } = useChat();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    
    await sendMessage(message);
    setMessage("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form 
       onSubmit={handleSubmit}
       className="w-full fixed z-50 bottom-0 flex items-center justify-center px-4 h-auto min-h-[65px] border-t-2 border-gray-600 bg-gray-900 shadow-lg py-2">
      {/* Plus Icon for Attachments */}
      <button 
        className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition"
        title="Add Attachment"
        aria-label="Add Attachment"
      >
        <BiPlus className="text-white text-2xl" />
      </button>

      {/* Expandable Input Field */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything..."
        rows={message.length > 50 ? 3 : 1} // Expands based on content length
        className="flex-1 mx-3 px-4 py-2 bg-gray-800 text-white placeholder-gray-400 rounded-full outline-none transition focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
        disabled={isLoading}
      />

      {/* Special Feature Buttons */}
      <div className="hidden md:flex gap-2">
        <FeatureButton icon={<MdOutlineTextFields />} label="Space Text" />
        <FeatureButton icon={<MdOutlineSearch />} label="In-Depth Search" />
        <FeatureButton icon={<IoMdFlash />} label="1-Click Prompts" />
        <FeatureButton icon={<FaBrain />} label="DeepThinking" />
        <FeatureButton icon={<MdOutlineSearch />} label="Vi v2" />
      </div>

      {/* Send Button */}
      <button 
        type="submit" 
        className="p-3 bg-blue-500 rounded-full hover:bg-blue-600 transition"
        title="Send Message"
        aria-label="Send Message"
        disabled={!message.trim() || isLoading}
      >
        <BiArrowToTop className="text-white text-2xl" />
      </button>
    </form>
  );
}

// Reusable Button Component
interface FeatureButtonProps {
  icon: ReactElement;
  label: string;
}

const FeatureButton: React.FC<FeatureButtonProps> = ({ icon, label }) => (
  <button 
    className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition"
    title={label}
    aria-label={label}
  >
    {icon} <span>{label}</span>
  </button>
);
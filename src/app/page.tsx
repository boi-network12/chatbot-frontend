"use client"

import ChatDisplay from "@/components/ChatDisplay/ChatDisplay"
import Header from "@/components/Header/Header"
import History from "@/components/History/History"
import Input from "@/components/Input/Input"
import { useState } from "react"

export default function Home() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  

  return (
    <div className="flex flex-row bg-gray-900 h-[100vh]">
      <History isOpen={isOpen}/>
      <main>
        <section>
          <Header toggleDrawer={() => setIsOpen(!isOpen)}/>
        </section>
        <section>
          <ChatDisplay />
        </section>
        <section>
          <Input />
        </section>
      </main>
    </div>
  )
}
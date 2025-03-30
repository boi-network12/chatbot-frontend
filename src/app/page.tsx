"use client"

import ChatDisplay from "@/components/ChatDisplay/ChatDisplay"
import Header from "@/components/Header/Header"
import History from "@/components/History/History"
import Input from "@/components/Input/Input"
import { useState } from "react"

export default function Home() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  

  return (
    <div className="bg-gray-900 h-[100vh] w-full">
      <History isOpen={isOpen}/>
      <main>
        <section>
          <Header toggleDrawer={() => setIsOpen(!isOpen)}/>
        </section>
        <section className="w-full">
          <ChatDisplay />
        </section>
        <section>
          <Input />
        </section>
      </main>
    </div>
  )
}
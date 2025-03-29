" use client";

import { AuthProvider } from "./authContext";
import { ChatProvider } from "./chatContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
           <ChatProvider>
             {children}
           </ChatProvider>
        </AuthProvider>
    )
}
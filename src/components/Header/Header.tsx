// components/Header.tsx
"use client"
import useAuth from "@/hooks/useAuth";
import { BiChevronDown, BiEdit, BiMenuAltLeft } from "react-icons/bi"
import { useState } from "react";
import AuthModal from "../AuthModal/AuthModal";
import { useChat } from "@/context/chatContext";

interface HeaderProps {
    toggleDrawer: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleDrawer }) => {
    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { clearChat  } = useChat();

    const handleNewChat = async () => {
        try {
            await clearChat();
        } catch (error) {
            console.error("Error creating new chat:", error);
        }
    };

    return (
        <>
            <div className="w-full bg-gray-900 border-b-2 border-b-gray-500  h-[70px] fixed top-0 left-0 flex items-center justify-between px-5 z-50">
                <div className="flex  gap-5 items-center justify-start">
                    <p onClick={toggleDrawer}>
                        <BiMenuAltLeft className=" text-gray-200 font-semibold text-2xl capitalize cursor-pointer"/>
                    </p>
                    <p onClick={handleNewChat}>
                        <BiEdit className=" text-gray-200 font-semibold text-2xl capitalize cursor-pointer" />
                    </p>
                    <p className=" text-gray-200 font-semibold text-xl capitalize flex items-center gap-2 cursor-pointer">
                        Chat bot <BiChevronDown className="text-2xl" />
                    </p>
                </div>
                <div>
                    {user ? (
                        <div>
                            <p className="text-gray-200">{user?.name}</p>
                        </div>
                    ) : (
                        <div>
                            <p 
                                className="text-gray-200 underline cursor-pointer"
                                onClick={() => setShowAuthModal(true)}
                            >
                                Sign up
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {showAuthModal && (
                <AuthModal onClose={() => setShowAuthModal(false)} />
            )}
        </>
    )
}

export default Header;
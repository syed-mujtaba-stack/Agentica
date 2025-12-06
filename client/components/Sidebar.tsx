"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
    Search,
    MessageSquare,
    Mic,
    Image as ImageIcon,
    FolderKanban,
    History,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const navItems = [
    { icon: Search, label: "Search", active: false },
    { icon: MessageSquare, label: "Chat", active: true },
    { icon: Mic, label: "Voice", active: false },
    { icon: ImageIcon, label: "Imagine", active: false, href: "/imagine" },
    { icon: FolderKanban, label: "Projects", active: false, href: "/projects" },
];

type Conversation = {
    id: number;
    title: string;
};

interface SidebarProps {
    onSelectConversation: (id: number | null) => void;
    currentConversationId: number | null;
}

export default function Sidebar({ onSelectConversation, currentConversationId }: SidebarProps) {
    const [activeTab, setActiveTab] = useState("Chat");
    const [history, setHistory] = useState<Conversation[]>([]);

    useEffect(() => {
        fetchHistory();
    }, [currentConversationId]); // Refresh when selection changes (or new chat created)

    const fetchHistory = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversations`);
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden md:flex h-screen w-64 flex-col justify-between border-r border-white/5 bg-black/40 backdrop-blur-xl p-4"
        >
            <div className="flex flex-col gap-8">
                {/* Logo Area */}
                <div className="pl-4 pt-2 cursor-pointer" onClick={() => onSelectConversation(null)}>
                    <h1 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
                        <Image src="/logo.svg" alt="Agentica Logo" width={32} height={32} className="w-8 h-8" />
                        Agentica
                    </h1>
                </div>

                {/* Main Navigation */}
                <nav className="flex flex-col gap-2">
                    <div className="px-4 py-2">
                        <button className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white px-4 py-2.5 rounded-full transition-all text-sm font-medium border border-white/5 text-left">
                            <Search className="w-4 h-4" />
                            <span>Search Ctrl+K</span>
                        </button>
                    </div>

                    {navItems.map((item) => (
                        item.href ? (
                            <Link key={item.label} href={item.href}>
                                <div className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 rounded-full transition-all text-sm font-medium cursor-pointer",
                                    item.active
                                        ? "text-white bg-white/10 font-semibold"
                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                )}>
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </div>
                            </Link>
                        ) : (
                            <button
                                key={item.label}
                                onClick={() => { setActiveTab(item.label); if (item.label === "Chat") onSelectConversation(null); }}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 rounded-full transition-all text-sm font-medium",
                                    activeTab === item.label && currentConversationId === null
                                        ? "text-white bg-white/10 font-semibold"
                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </button>
                        )
                    ))}
                </nav>

                {/* History Section */}
                <div className="flex flex-col gap-4 mt-4 px-4 overflow-y-auto max-h-[40vh] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        <span>History</span>
                        <History className="w-3 h-3" />
                    </div>
                    <div className="flex flex-col gap-2">
                        {history.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => onSelectConversation(chat.id)}
                                className={cn(
                                    "text-sm text-left truncate w-full px-2 py-1.5 rounded-md transition-colors",
                                    currentConversationId === chat.id
                                        ? "bg-white/10 text-white"
                                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {chat.title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* User Section */}
            <Link href="/profile">
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/20">
                            U
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">My Profile</span>
                            <span className="text-xs text-zinc-500">View Stats</span>
                        </div>
                    </div>
                    <Settings className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                </div>
            </Link>
        </motion.div>
    );
}

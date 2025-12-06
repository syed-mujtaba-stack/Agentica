"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Image as ImageIcon, Sparkles, Globe, Search, Volume2, VolumeX, LogOut } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { cn } from "@/lib/utils";
import { useSpeech } from "@/hooks/useSpeech";
import { playSound } from "@/lib/sounds";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    agent?: "NEXUS" | "CIPHER" | "ZENITH" | "APEX" | "VORTEX" | "NOVA" | "ECHO" | "ORBIT" | "FLUX" | "SPARK" | "RIFT" | "PULSE" | "VERTEX";
};

interface ChatInterfaceProps {
    conversationId: number | null;
}

export default function ChatInterface({ conversationId }: ChatInterfaceProps) {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [hasStarted, setHasStarted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isDeepSearchEnabled, setIsDeepSearchEnabled] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [token, setToken] = useState<string | null>(null);

    // Auth Check
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            router.push("/login");
        } else {
            setToken(storedToken);
        }
    }, [router]);

    const {
        isListening,
        transcript,
        startListening,
        stopListening,
        speak,
        isSpeaking,
        stopSpeaking
    } = useSpeech();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Sync transcription to input
    useEffect(() => {
        if (transcript) {
            setInput(transcript);
        }
    }, [transcript]);

    // Fetch messages when conversationId changes
    useEffect(() => {
        if (conversationId) {
            setHasStarted(true);
            fetchMessages(conversationId);
        } else {
            setHasStarted(false);
            setMessages([]);
        }
    }, [conversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const fetchMessages = async (id: number) => {
        try {
            if (!token) return;
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversations/${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const formattedMessages: Message[] = data.messages.map((m: any) => ({
                    id: m.id.toString(),
                    role: m.role,
                    content: m.content,
                    agent: m.agent
                }));
                setMessages(formattedMessages);
            } else {
                console.warn(`Conversation ${id} not found.`);
            }
        } catch (error) {
            console.error("Error fetching conversation", error);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        if (!hasStarted) setHasStarted(true);
        playSound('send');

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            if (!token) throw new Error("No token");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    conversation_id: conversationId,
                    use_search: isDeepSearchEnabled
                }),
            });

            if (response.status === 401) {
                localStorage.removeItem("token");
                router.push("/login");
                throw new Error("Unauthorized");
            }
            if (!response.ok) throw new Error("Failed to fetch response");

            const data = await response.json();
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.response,
                agent: data.agent,
            };
            setMessages((prev) => [...prev, aiMessage]);
            playSound('receive');

            if (!isMuted) {
                speak(data.response);
            }

        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "Sorry, I encountered an error. Please try again.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMic = () => {
        if (isListening) {
            stopListening();
            playSound('click');
        } else {
            startListening();
            playSound('uianim');
        }
    };

    const toggleDeepSearch = () => {
        setIsDeepSearchEnabled(!isDeepSearchEnabled);
        playSound('click');
    };

    // Empty State View (Centered Logo + Input)
    if (!hasStarted) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-8 w-full max-w-2xl"
                >
                    {/* Large Centered Logo */}
                    <div className="flex items-center gap-4 mb-8">
                        <Image src="/logo.svg" alt="Agentica Logo" width={80} height={80} className="w-20 h-20 drop-shadow-[0_0_40px_rgba(59,130,246,0.5)]" />
                        <h1 className="text-6xl font-bold text-white font-display tracking-tight">Agentica</h1>
                    </div>

                    {/* Centered Search Bar */}
                    <div className="w-full relative">
                        <form onSubmit={handleSubmit} className="w-full">
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-30 group-hover:opacity-60 transition duration-500 blur-md"></div>
                                <div className="relative flex items-center bg-[#1a1a1a] rounded-full border border-white/10 px-6 py-4 shadow-2xl">
                                    <Search className="w-5 h-5 text-zinc-500 mr-4" />
                                    <input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={isDeepSearchEnabled ? "Search the web..." : "What you want to know?"}
                                        className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-zinc-500 font-medium"
                                        autoFocus
                                    />
                                    <div className="flex items-center gap-3 border-l border-white/10 pl-4 ml-2">
                                        <span className="text-zinc-500 text-sm font-medium">Auto</span>
                                        <button
                                            type="button"
                                            onClick={toggleMic}
                                            className={cn(
                                                "p-2 rounded-full transition-transform hover:scale-110",
                                                isListening ? "bg-red-500 text-white animate-pulse" : "bg-white text-black"
                                            )}
                                        >
                                            <Mic className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 justify-center mt-4">
                        <button
                            onClick={toggleDeepSearch}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full border transition-colors text-sm font-medium",
                                isDeepSearchEnabled ? "bg-blue-500/20 border-blue-500 text-blue-400" : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                            )}
                        >
                            <Globe className="w-4 h-4" />
                            DeepSearch
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium">
                            <ImageIcon className="w-4 h-4" />
                            Create Image
                        </button>
                        <button
                            onClick={toggleMic}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full border transition-colors text-sm font-medium",
                                isListening ? "bg-red-500/20 border-red-500 text-red-400" : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                            )}
                        >
                            <Mic className="w-4 h-4" />
                            Voice
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Active Chat State
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-full w-full flex-col relative"
        >
            {/* Top Header */}
            <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/20 to-transparent">
                <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Agentica Flash 2.0
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleDeepSearch}
                        className={cn(
                            "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full transition-colors border",
                            isDeepSearchEnabled ? "bg-blue-500/20 border-blue-500 text-blue-400" : "border-transparent text-zinc-500 hover:text-white"
                        )}
                    >
                        <Globe className="w-3 h-3" />
                        Search {isDeepSearchEnabled ? 'On' : 'Off'}
                    </button>
                    <button onClick={() => setIsMuted(!isMuted)} className="text-zinc-500 hover:text-white transition-colors">
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            router.push("/login");
                        }}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                    <button className="text-zinc-500 hover:text-white transition-colors text-sm">
                        Private
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto p-4 pt-20 pb-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <AnimatePresence initial={false}>
                    {messages.map((m) => (
                        <MessageBubble
                            key={m.id}
                            role={m.role}
                            content={m.content}
                            agent={m.agent}
                        />
                    ))}
                </AnimatePresence>
                {isLoading && (
                    <div className="flex items-center gap-2 ml-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white animate-spin" />
                        </div>
                        <span className="text-zinc-500 text-sm">
                            {isDeepSearchEnabled ? "Browsing the web..." : "Routing to agent..."}
                        </span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area */}
            <div className="w-full max-w-3xl mx-auto p-6">
                <form onSubmit={handleSubmit} className="relative">
                    <div className="relative bg-[#1a1a1a] rounded-[2rem] border border-white/10 p-2 shadow-2xl flex items-end gap-2">
                        <button type="button" className="p-3 text-zinc-400 hover:text-white transition-colors">
                            <ImageIcon className="w-5 h-5" />
                        </button>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Message Agentica..."
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-500 min-h-[44px] max-h-32 py-2.5 px-2 resize-none font-medium"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="p-3 bg-white rounded-full text-black hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}

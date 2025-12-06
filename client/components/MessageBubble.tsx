"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import {
    Bot, User, Code, PenTool, Sparkles,
    Briefcase, FlaskConical, GraduationCap, ScrollText, Plane,
    Scale, Wrench, Shield, HeartPulse, Calculator
} from "lucide-react";

interface MessageBubbleProps {
    role: "user" | "assistant";
    content: string;
    agent?: "NEXUS" | "CIPHER" | "ZENITH" | "APEX" | "VORTEX" | "NOVA" | "ECHO" | "ORBIT" | "FLUX" | "SPARK" | "RIFT" | "PULSE" | "VERTEX";
}

const AgentConfig: Record<string, { icon: any, color: string, label: string }> = {
    NEXUS: { icon: Sparkles, color: "bg-blue-500", label: "Nexus" },
    CIPHER: { icon: Code, color: "bg-emerald-500", label: "Cipher" },
    ZENITH: { icon: PenTool, color: "bg-purple-500", label: "Zenith" },

    // New Agents
    APEX: { icon: Briefcase, color: "bg-orange-500", label: "Apex" },
    VORTEX: { icon: FlaskConical, color: "bg-teal-500", label: "Vortex" },
    NOVA: { icon: GraduationCap, color: "bg-yellow-500", label: "Nova" },
    ECHO: { icon: ScrollText, color: "bg-amber-600", label: "Echo" },
    ORBIT: { icon: Plane, color: "bg-sky-500", label: "Orbit" },
    FLUX: { icon: Scale, color: "bg-indigo-500", label: "Flux" },
    SPARK: { icon: Wrench, color: "bg-pink-500", label: "Spark" },
    RIFT: { icon: Shield, color: "bg-red-500", label: "Rift" },
    PULSE: { icon: HeartPulse, color: "bg-rose-500", label: "Pulse" },
    VERTEX: { icon: Calculator, color: "bg-cyan-600", label: "Vertex" },
};

export default function MessageBubble({ role, content, agent = "NEXUS" }: MessageBubbleProps) {
    const isUser = role === "user";
    const config = AgentConfig[agent] || AgentConfig["NEXUS"];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={cn(
                "flex w-full items-start gap-4",
                isUser ? "flex-row-reverse" : "flex-row"
            )}
        >
            <div
                className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-lg backdrop-blur-sm border border-white/5",
                    isUser
                        ? "bg-white text-black"
                        : `${config.color} text-white`
                )}
            >
                {isUser ? <User className="h-5 w-5" /> : <config.icon className="h-5 w-5" />}
            </div>

            <div className="flex flex-col gap-1 max-w-[85%]">
                {!isUser && (
                    <span className={cn("text-xs font-bold ml-1 opacity-80 uppercase tracking-widest",
                        // Dynamic text color matching background or just white
                        "text-zinc-400"
                    )}>
                        {config.label}
                    </span>
                )}
                <div
                    className={cn(
                        "relative rounded-3xl px-6 py-4 text-sm shadow-md backdrop-blur-md transition-colors",
                        isUser
                            ? "rounded-tr-sm bg-white/10 text-white border border-white/10"
                            : "rounded-tl-sm bg-black/40 text-zinc-100 border border-white/5 shadow-inner"
                    )}
                >
                    <div className="prose prose-invert prose-sm leading-relaxed max-w-none">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

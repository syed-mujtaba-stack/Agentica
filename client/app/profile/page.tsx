"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogOut, User, MessageSquare, Calendar, ChevronLeft, Shield, Zap } from "lucide-react";

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("Failed to fetch profile");
            })
            .then(data => {
                setProfile(data);
                setIsLoading(false);
            })
            .catch(() => {
                localStorage.removeItem("token");
                router.push("/login");
            });
    }, [router]);

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen w-full bg-black text-white p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[128px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[128px]" />

            <div className="max-w-4xl mx-auto relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Squad
                </Link>

                <div className="flex items-end justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold shadow-2xl shadow-blue-500/20">
                            {profile.email[0].toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Agent Profile</h1>
                            <p className="text-zinc-400 font-mono">{profile.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            router.push("/login");
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors border border-red-500/20 font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Disconnect
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-2xl bg-[#1a1a1a] border border-white/5"
                    >
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-bold mb-1">{profile.conversation_count}</div>
                        <div className="text-zinc-500 text-sm">Active Missions</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 rounded-2xl bg-[#1a1a1a] border border-white/5"
                    >
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-bold mb-1">{profile.message_count}</div>
                        <div className="text-zinc-500 text-sm">Total Interactions</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 rounded-2xl bg-[#1a1a1a] border border-white/5"
                    >
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 mb-4">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-bold mb-1">Level 1</div>
                        <div className="text-zinc-500 text-sm">Security Clearance</div>
                    </motion.div>
                </div>

                <div className="p-8 rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-black border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                    <h2 className="text-xl font-bold mb-6">System Status</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="font-medium">Core Systems Online</span>
                            </div>
                            <span className="text-zinc-500 text-sm">v2.4.0</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="font-medium">Neural Link Active</span>
                            </div>
                            <span className="text-zinc-500 text-sm">Latency: 12ms</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Download, Share2, Wand2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ImaginePage() {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt) return;

        setIsGenerating(true);
        // Pollinations.ai URL construction
        const encodedPrompt = encodeURIComponent(prompt);
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 10000)}`;

        // Simulate loading for better UX (Pollinations is usually instant but image load takes a sec)
        setGeneratedImage(url);

        // Wait for image to load
        const img = new window.Image();
        img.src = url;
        img.onload = () => setIsGenerating(false);
    };

    return (
        <div className="min-h-screen w-full bg-black text-white p-8 relative overflow-hidden flex flex-col">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[128px]" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[128px]" />

            <div className="max-w-6xl mx-auto w-full relative z-10 flex-1 flex flex-col">
                <header className="flex items-center justify-between mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Squad
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-pink-400">
                        <Sparkles className="w-3 h-3" />
                        POWERED BY POLLINATIONS.AI
                    </div>
                </header>

                <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
                    {/* Controls */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-6">
                        <div>
                            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
                                Imagine
                            </h1>
                            <p className="text-zinc-400">
                                Visualize your ideas instantly with AI. High-fidelity, real-time generation.
                            </p>
                        </div>

                        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Prompt</label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="A cyberpunk city street at night, neon lights, rain, highly detailed..."
                                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isGenerating || !prompt}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <Wand2 className="w-5 h-5 animate-spin" />
                                        Dreaming...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-5 h-5" />
                                        Generate Art
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <h3 className="text-sm font-bold text-white mb-2">Tips</h3>
                            <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                                <li>Be specific about lighting (e.g., "cinematic lighting", "neon").</li>
                                <li>Mention style (e.g., "anime", "photorealistic", "oil painting").</li>
                                <li>Try adding "4k", "detailed", "masterpiece".</li>
                            </ul>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="w-full lg:w-2/3 bg-[#0a0a0a] rounded-3xl border border-white/5 flex items-center justify-center relative overlow-hidden group">
                        <AnimatePresence mode="wait">
                            {generatedImage ? (
                                <motion.div
                                    key={generatedImage}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="relative w-full h-full p-4"
                                >
                                    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-pink-500/10">
                                        {/* Using regular img tag for external URLs to avoid Next.js Image config requirement for dynamic domains */}
                                        <img
                                            src={generatedImage}
                                            alt="Generated"
                                            className="w-full h-full object-contain bg-black/50"
                                        />

                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a
                                                href={generatedImage}
                                                download="generated-art.jpg"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 bg-black/50 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-colors"
                                            >
                                                <Download className="w-5 h-5" />
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="text-center p-8">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-600">
                                        <Sparkles className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-300">Ready to Dream</h3>
                                    <p className="text-zinc-500 max-w-sm mt-2">
                                        Enter a prompt to start generating visualizations.
                                    </p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FolderKanban, Plus, ChevronLeft, MoreVertical, Calendar } from "lucide-react";

type Project = {
    id: number;
    title: string;
    description: string;
    created_at: string;
};

export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectTitle, setNewProjectTitle] = useState("");
    const [newProjectDesc, setNewProjectDesc] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setProjects(data))
            .catch(err => console.error(err));
    }, [router]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token || !newProjectTitle) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title: newProjectTitle, description: newProjectDesc })
            });

            if (res.ok) {
                const project = await res.json();
                setProjects([project, ...projects]);
                setIsCreating(false);
                setNewProjectTitle("");
                setNewProjectDesc("");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen w-full bg-black text-white p-8 relative overflow-hidden flex flex-col">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[128px]" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[128px]" />

            <div className="max-w-6xl mx-auto w-full relative z-10 flex-1 flex flex-col">
                <header className="flex items-center justify-between mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Squad
                    </Link>
                </header>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                            Projects
                        </h1>
                        <p className="text-zinc-400">
                            Organize your missions and conversations.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Project
                    </button>
                </div>

                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-6 rounded-2xl bg-[#1a1a1a] border border-white/10"
                    >
                        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newProjectTitle}
                                    onChange={(e) => setNewProjectTitle(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="Project Name (e.g. Quantum Research)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
                                <textarea
                                    value={newProjectDesc}
                                    onChange={(e) => setNewProjectDesc(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 h-24 resize-none"
                                    placeholder="What is this project about?"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                                >
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 hover:border-indigo-500/50 transition-colors group cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                    <FolderKanban className="w-5 h-5" />
                                </div>
                                <button className="text-zinc-500 hover:text-white">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{project.title}</h3>
                            <p className="text-zinc-400 text-sm mb-6 line-clamp-2">
                                {project.description || "No description provided."}
                            </p>
                            <div className="flex items-center text-xs text-zinc-500 gap-2">
                                <Calendar className="w-3 h-3" />
                                {new Date(project.created_at).toLocaleDateString()}
                            </div>
                        </motion.div>
                    ))}

                    {projects.length === 0 && !isCreating && (
                        <div className="col-span-full py-20 text-center text-zinc-500">
                            <FolderKanban className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No projects yet. Create one to get started!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

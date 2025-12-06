"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AnimatedBackground() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-[#05050A]">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 brightness-150 contrast-150 mix-blend-overlay" />

            {/* Aurora 1 */}
            <motion.div
                className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen"
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Aurora 2 */}
            <motion.div
                className="absolute top-[20%] right-[0%] w-[60vw] h-[60vw] bg-blue-600/15 rounded-full blur-[100px] mix-blend-screen"
                animate={{
                    x: [0, -40, 0],
                    y: [0, 60, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Interactive Blob */}
            <motion.div
                className="absolute w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"
                animate={{
                    x: mousePosition.x - 400,
                    y: mousePosition.y - 400,
                }}
                transition={{
                    type: "spring",
                    damping: 50,
                    stiffness: 50,
                }}
            />
        </div>
    );
}

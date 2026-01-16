import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"

export interface FloatingMenuItem {
    icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode
    label: string
    onClick?: () => void
    active?: boolean
}

interface FloatingMenuProps {
    items: FloatingMenuItem[]
    className?: string
}

export function FloatingMenu({ items, className }: FloatingMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <div className={cn("relative flex flex-col items-center", className)}>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
                        />

                        {/* Menu Items Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            className="absolute bottom-20 z-50 w-64 bg-slate-900/95 border border-slate-800 p-2 rounded-3xl shadow-2xl"
                        >
                            <div className="grid grid-cols-3 gap-2">
                                {items.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            item.onClick?.()
                                            setIsOpen(false)
                                        }}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-3 rounded-2xl transition-all",
                                            item.active
                                                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                                : "text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent"
                                        )}
                                    >
                                        <div className="mb-1">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-bold text-center leading-tight uppercase tracking-tighter">
                                            {item.label.split(' ')[0]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Toggle Button (The Ball) */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] z-50 transition-all duration-500",
                    isOpen
                        ? "bg-slate-900 border-2 border-cyan-500/50 text-cyan-400 rotate-90 shadow-[0_0_40px_rgba(6,182,212,0.5)]"
                        : "bg-cyan-600 text-white hover:bg-cyan-500 hover:shadow-[0_0_50px_rgba(6,182,212,0.6)]"
                )}
            >
                {isOpen ? <X size={32} /> : <Menu size={32} />}

                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping pointer-events-none"
                    />
                )}
            </motion.button>
        </div>
    )
}

"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function Loading() {
  // Optional: Auto-redirect after a timeout (e.g., for demo purposes)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate loading completion (replace with actual logic)
      console.log("Loading complete")
    }, 5000) // 5 seconds for demo
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Logo or App Name */}
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-white"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Admin Panel
          </motion.h1>

          {/* Spinner with Gradient and Pulse */}
          <div className="relative">
            <motion.div
              className="w-16 h-16 border-4 border-t-primary border-gray-700 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-primary/20 to-transparent rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>

          {/* Loading Text */}
          <motion.p
            className="text-gray-400 text-lg md:text-xl"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Loading...
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
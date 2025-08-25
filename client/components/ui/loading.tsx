"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50 font-montserrat">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Loader2 Icon with Pulse */}
          <div className="relative">
            <motion.div
              className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            >
              <Loader2 className="w-7 h-7 md:w-8 md:h-8 text-primary" />
            </motion.div>
            <motion.div
              className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-primary/20 to-transparent rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>

          {/* Loading Text */}
          <motion.p
            className="text-gray-400 text-lg md:text-xl font-medium"
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
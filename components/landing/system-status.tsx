"use client";

import { motion } from "framer-motion";

export function SystemStatus() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.6 }}
      className="fixed bottom-6 right-6 z-40 hidden lg:block"
    >
      <div className="rounded-[3px] border-2 border-primary/20 bg-[#0A0505]/95 backdrop-blur-xl px-4 py-3 shadow-2xl">
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="relative">
            <motion.div
              className="w-2 h-2 rounded-full bg-primary"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute inset-0 w-2 h-2 rounded-full bg-primary"
              animate={{
                scale: [1, 2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Status text */}
          <div className="text-xs">
            <div className="font-bold text-white uppercase tracking-wider">
              System Active
            </div>
            <div className="text-gray-500 font-medium">
              All systems operational
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

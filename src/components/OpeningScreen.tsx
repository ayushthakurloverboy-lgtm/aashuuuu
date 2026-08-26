import React from 'react';
import { motion } from 'motion/react';

interface OpeningScreenProps {
  onStart: () => void;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({ onStart }) => {
  return (
    <motion.div
      id="opening-screen-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 text-center bg-[#0a0a0c]/85 backdrop-blur-[3px]"
    >
      {/* Subtle decorative pulsing ambient ring */}
      <div className="absolute w-64 h-64 rounded-full border border-white/5 animate-pulse pointer-events-none" />

      {/* Main card container */}
      <div className="relative max-w-sm w-full mx-auto flex flex-col items-center z-10">
        {/* Subtle decorative thread icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.9, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.2 }}
          className="mb-5 relative"
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" className="thread-glow text-[#d4af37]">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeDasharray="3 1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        {/* Small gold subtitle marker */}
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.0, delay: 0.3 }}
          className="text-[#d4af37] text-xs uppercase tracking-[0.3em] font-sans mb-3"
        >
          Special Surprise
        </motion.span>

        {/* Hey Vagmii ❤️ */}
        <motion.h1
          id="opening-greeting-title"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.45, ease: 'easeOut' }}
          className="font-romantic text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide text-[#f0e6d2] text-glow mb-4"
        >
          Hey Vagmii <span className="text-rose-400 font-sans inline-block hover:scale-110 transition-transform">❤️</span>
        </motion.h1>

        {/* Please click the start button... This song is for you. */}
        <motion.div
          id="opening-subtext-message"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.85, y: 0 }}
          transition={{ duration: 1.2, delay: 0.7, ease: 'easeOut' }}
          className="font-handwriting text-xl sm:text-2xl text-[#f0e6d2]/85 mb-10 leading-relaxed max-w-xs space-y-1"
        >
          <p>Please click the start button...</p>
          <p className="text-[#f5d77f] font-semibold">This song is for you.</p>
        </motion.div>

        {/* Start ♡ Button */}
        <motion.button
          id="start-surprise-button"
          type="button"
          onClick={onStart}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(212, 175, 55, 0.3)' }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.8, delay: 0.95 }}
          className="group relative px-8 py-3.5 rounded-full border border-[#d4af37]/40 bg-gradient-to-b from-[#181822] to-[#0f0f14] text-[#f0e6d2] font-medium tracking-wide text-base shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:border-[#d4af37]/80 transition-all duration-300 active:outline-none cursor-pointer"
        >
          <span className="flex items-center gap-2 font-romantic text-xl tracking-wider text-glow">
            Start <span className="text-[#d4af37] group-hover:text-amber-200 transition-colors">♡</span>
          </span>
          {/* Subtle pulse ring around button */}
          <span className="absolute -inset-1 rounded-full border border-[#d4af37]/25 animate-ping pointer-events-none opacity-40" />
        </motion.button>

        {/* Track hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="mt-12 text-[11px] font-sans tracking-[0.25em] uppercase text-stone-400/60"
        >
          Secret Door • Arctic Monkeys
        </motion.p>
      </div>
    </motion.div>
  );
};


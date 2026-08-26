import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LyricLine } from '../types';

interface LyricsDisplayProps {
  currentLine: LyricLine | null;
  currentTime: number;
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ currentLine }) => {
  return (
    <div
      id="lyrics-display-container"
      className="absolute bottom-12 sm:bottom-16 left-0 right-0 z-30 pointer-events-none flex flex-col items-center justify-end px-6 min-h-[140px]"
    >
      <AnimatePresence mode="wait">
        {currentLine && (
          <motion.div
            key={currentLine.id}
            id={`lyric-line-${currentLine.id}`}
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-center max-w-md w-full bg-black/40 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
          >
            {/* Elegant lyric line text */}
            <p className="font-romantic text-xl sm:text-2xl text-[#f0e6d2] tracking-wide leading-relaxed lyric-text">
              {currentLine.text.split(' ').map((word, wIdx) => {
                const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').toLowerCase();
                const isHighlighted = currentLine.emphasisWords?.some(
                  (ew) => cleanWord.includes(ew.toLowerCase()) || ew.toLowerCase().includes(cleanWord)
                );

                if (isHighlighted) {
                  return (
                    <motion.span
                      key={wIdx}
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.04, 1] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="inline-block mx-1 font-semibold text-[#f5d77f] text-glow-highlight"
                    >
                      {word}
                    </motion.span>
                  );
                }

                return (
                  <span key={wIdx} className="inline-block mx-0.5 text-white/90">
                    {word}
                  </span>
                );
              })}
            </p>

            {/* Glowing champagne thread flourish below the lyric */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.7 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-2.5 mx-auto w-24 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/70 to-transparent"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

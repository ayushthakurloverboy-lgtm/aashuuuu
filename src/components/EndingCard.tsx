import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Heart } from 'lucide-react';

interface EndingCardProps {
  onReplay: () => void;
}

export const EndingCard: React.FC<EndingCardProps> = ({ onReplay }) => {
  return (
    <motion.div
      id="ending-personal-card"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      className="absolute bottom-10 left-0 right-0 z-30 flex flex-col items-center justify-center px-6 pointer-events-auto"
    >
      <div className="bg-[#12121a]/85 backdrop-blur-md border border-[#d4af37]/30 rounded-2xl p-6 max-w-xs w-full text-center shadow-[0_0_35px_rgba(212,175,55,0.15)] flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center mb-2.5 text-[#d4af37]">
          <Heart className="w-4 h-4 fill-[#d4af37]/60" />
        </div>

        <span className="text-[#d4af37] text-[10px] uppercase tracking-[0.25em] font-sans opacity-80 mb-1">
          Forever
        </span>

        <h2 className="font-romantic text-2xl sm:text-3xl text-[#f0e6d2] text-glow mb-1">
          For Vagmii
        </h2>

        <p className="font-handwriting text-xl text-[#f5d77f]/90 mb-4">
          "And as she came to bloom..."
        </p>

        <button
          id="replay-experience-button"
          type="button"
          onClick={onReplay}
          className="flex items-center gap-2 px-5 py-2 rounded-full border border-[#d4af37]/40 bg-black/60 text-[#f0e6d2] text-sm font-sans tracking-wide hover:bg-[#1a1a26] hover:border-[#d4af37]/80 hover:text-white transition-all cursor-pointer shadow-[0_0_12px_rgba(0,0,0,0.5)]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Play Again ♡</span>
        </button>
      </div>
    </motion.div>
  );
};


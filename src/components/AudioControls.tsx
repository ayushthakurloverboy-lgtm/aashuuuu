import React from 'react';
import { Play, Pause, Music2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AudioControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  progressRatio: number;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  onTogglePlay,
  progressRatio,
}) => {
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-auto"
    >
      {/* Track info pill */}
      <div className="flex items-center space-x-2.5 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
        <Music2 className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
        <span className="text-[11px] sm:text-xs font-sans tracking-wide text-white/80">
          Secret Door <span className="text-white/40">•</span> Arctic Monkeys
        </span>
      </div>

      {/* Play/Pause Button with Circular Gold Progress Ring */}
      <button
        id="minimal-audio-toggle-button"
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
        className="relative w-10 h-10 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/10 text-stone-300 hover:text-[#d4af37] transition-all p-0 cursor-pointer focus:outline-none shadow-[0_0_12px_rgba(0,0,0,0.5)]"
      >
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1.5"
          />
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke="#d4af37"
            strokeWidth="1.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 fill-current opacity-80" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-current opacity-80 translate-x-0.5" />
        )}
      </button>
    </motion.div>
  );
};

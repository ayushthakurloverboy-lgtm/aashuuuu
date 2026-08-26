import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SECRET_DOOR_LYRICS, TOTAL_SONG_DURATION } from './data/lyrics';
import { secretDoorAudio } from './audio/secretDoorAudio';
import { ThreadCanvas } from './components/ThreadCanvas';
import { OpeningScreen } from './components/OpeningScreen';
import { LyricsDisplay } from './components/LyricsDisplay';
import { AudioControls } from './components/AudioControls';
import { EndingCard } from './components/EndingCard';

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isEnded, setIsEnded] = useState(false);

  // Sync audio engine with state
  useEffect(() => {
    secretDoorAudio.onTimeUpdate((time) => {
      setCurrentTime(time);
      if (time >= TOTAL_SONG_DURATION - 0.2) {
        setIsEnded(true);
      }
    });

    secretDoorAudio.onEnded(() => {
      setIsPlaying(false);
      setIsEnded(true);
    });

    return () => {
      secretDoorAudio.pause();
    };
  }, []);

  const handleStart = () => {
    setHasStarted(true);
    setIsPlaying(true);
    setIsEnded(false);
    secretDoorAudio.start(0);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      secretDoorAudio.pause();
      setIsPlaying(false);
    } else {
      secretDoorAudio.resume();
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    setIsEnded(false);
    setCurrentTime(0);
    setIsPlaying(true);
    secretDoorAudio.start(0);
  };

  const handleCanvasTouch = useCallback((xRatio: number, yRatio: number) => {
    if (hasStarted) {
      secretDoorAudio.playTouchHarp(xRatio, yRatio);
    }
  }, [hasStarted]);

  // Determine current active lyric line
  const currentLine = useMemo(() => {
    if (!hasStarted) return null;
    return (
      SECRET_DOOR_LYRICS.find(
        (line) => currentTime >= line.startTime && currentTime <= line.endTime
      ) || null
    );
  }, [hasStarted, currentTime]);

  const progressRatio = Math.min(1, currentTime / TOTAL_SONG_DURATION);

  return (
    <div className="w-full h-full min-h-[100dvh] bg-[#0a0a0c] flex items-center justify-center font-serif text-[#f0e6d2] overflow-hidden">
      <main
        id="romantic-experience-main"
        className="relative w-full h-[100dvh] max-w-md sm:max-h-[920px] sm:h-[95vh] sm:rounded-3xl bg-immersive sm:border sm:border-white/10 sm:shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden select-none flex flex-col justify-between"
      >
        {/* Immersive subtle film grain texture overlay */}
        <div className="grain pointer-events-none" />

        {/* Background Thread Drawing Engine */}
        <ThreadCanvas
          currentTime={hasStarted ? currentTime : 0}
          isPlaying={isPlaying}
          onCanvasClick={handleCanvasTouch}
        />

        {/* Opening Surprise Screen */}
        <AnimatePresence>
          {!hasStarted && <OpeningScreen onStart={handleStart} />}
        </AnimatePresence>

        {/* Main Experience Elements */}
        {hasStarted && (
          <>
            {/* Top Bar with Audio Controls and Track Title */}
            <AudioControls
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              progressRatio={progressRatio}
            />

            {/* Synced Lyrics Display at the bottom */}
            <LyricsDisplay currentLine={currentLine} currentTime={currentTime} />

            {/* Gentle interactive touch hint */}
            <AnimatePresence>
              {currentTime > 1 && currentTime < 7 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 0.5, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute bottom-3 left-0 right-0 text-center pointer-events-none z-20"
                >
                  <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#f0e6d2]/50">
                    Tap screen to weave glowing sparks ♡
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ending Romance Card */}
            <AnimatePresence>
              {isEnded && <EndingCard onReplay={handleReplay} />}
            </AnimatePresence>
          </>
        )}
      </main>
    </div>
  );
}

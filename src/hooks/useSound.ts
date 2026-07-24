'use client';

/**
 * Custom hook for playing notification sounds
 * Uses Web Audio API to generate a pleasant success sound
 */

import { useCallback, useRef, useState, useEffect } from 'react';

const STORAGE_KEY = 'vanitas-sound-enabled';

export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Load preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setSoundEnabled(stored === 'true');
    }
  }, []);

  // Save preference to localStorage
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEY, String(newValue));
      return newValue;
    });
  }, []);

  // Initialize AudioContext lazily (must be triggered by user action)
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }
    return audioContextRef.current;
  }, []);

  /**
   * Play a pleasant "success" sound
   * Two-tone chime that indicates completion
   */
  const playSuccessSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // First tone (lower)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.value = 523.25; // C5
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Second tone (higher) - slightly delayed
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = 659.25; // E5
      gain2.gain.setValueAtTime(0.3, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.4);

      // Third tone (highest) - creates the "success" feel
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.value = 783.99; // G5
      gain3.gain.setValueAtTime(0.25, now + 0.2);
      gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.2);
      osc3.stop(now + 0.6);
    } catch (error) {
      console.warn('Could not play sound:', error);
    }
  }, [soundEnabled, getAudioContext]);

  return {
    soundEnabled,
    toggleSound,
    playSuccessSound,
  };
}

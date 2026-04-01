"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Microphone, Stop } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function VoiceInputButton({
  onTranscript,
  disabled = false,
  className = "",
  size = "md",
}: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    );
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) {
        onTranscript(last[0].transcript.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "aborted") {
        console.error("Speech recognition error:", event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  if (!isSupported) return null;

  const iconSize = size === "sm" ? 14 : 18;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Pulsing ring when listening */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-red-500/30"
          />
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        className={`relative z-10 inline-flex items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-chain-active/50 disabled:pointer-events-none disabled:opacity-40 ${
          size === "sm" ? "h-8 w-8" : "h-10 w-10"
        } ${
          isListening
            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
            : "bg-bg-elevated text-text-secondary hover:text-text-primary hover:bg-bg-surface"
        }`}
        aria-label={isListening ? "Stop listening" : "Voice input"}
        title={isListening ? "Stop listening" : "Speak your symptoms"}
      >
        {isListening ? (
          <Stop size={iconSize} weight="fill" />
        ) : (
          <Microphone size={iconSize} weight="bold" />
        )}
      </motion.button>

      {/* Listening indicator text */}
      <AnimatePresence>
        {isListening && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            className="ml-2 text-xs text-red-400"
          >
            Listening...
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";

interface TypewriterProps {
  words: string[];
  pauseDuration?: number;
  fontSize?: number;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  words = ["Exemple", "Démo", "Typewriter"],
  pauseDuration = 2000,
  fontSize = 16, // Taille par défaut en pixels
}) => {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const currentWord = words[wordIndex];
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const typingSpeed = 200;
  const deletingSpeed = 100;

  // Effet pour faire clignoter le curseur
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  // Effet principal pour l'animation de frappe
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const handleTyping = () => {
      if (isPaused) {
        timeoutRef.current = setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, pauseDuration);
        return;
      }

      if (isDeleting) {
        if (displayText.length === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
          timeoutRef.current = setTimeout(handleTyping, typingSpeed);
        } else {
          setDisplayText((prev) => prev.slice(0, -1));
          timeoutRef.current = setTimeout(handleTyping, deletingSpeed);
        }
      } else {
        if (displayText.length === currentWord.length) {
          setIsPaused(true);
        } else {
          setDisplayText((prev) => currentWord.slice(0, prev.length + 1));
          timeoutRef.current = setTimeout(handleTyping, typingSpeed);
        }
      }
    };

    timeoutRef.current = setTimeout(handleTyping, typingSpeed);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [
    displayText,
    isDeleting,
    wordIndex,
    currentWord,
    words,
    isPaused,
    pauseDuration,
  ]);

  return (
    <span className="font-bold" style={{ fontSize: `${fontSize}px` }}>
      {displayText}
      <span className={cursorVisible ? "opacity-100" : "opacity-0"}>_</span>
    </span>
  );
};

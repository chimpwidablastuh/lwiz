"use client";
import React, { useState, useEffect } from "react";

interface TypewriterProps {
  text: string;
}

export const Typewriter = ({ text }: TypewriterProps) => {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [cursorVisible, setCursorVisible] = useState<boolean>(true);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text[index]);
      index++;
      if (index === text.length) {
        clearInterval(interval);
        setCursorVisible(false); // Hide cursor after typing is finished
      }
    }, 100); // Adjust typing speed here
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div>
      <span>{displayedText}</span>
      {cursorVisible && <span>_</span>}
    </div>
  );
};

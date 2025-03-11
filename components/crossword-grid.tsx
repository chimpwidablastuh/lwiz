"use client";

import { useState, useEffect } from "react";
import { ArrowDown } from "lucide-react";
import type { CrosswordData } from "@/components/crossword-generator";

interface CrosswordGridProps {
  crosswordData: CrosswordData;
  hidden?: boolean;
  playMode?: boolean;
}

export function CrosswordGrid({
  crosswordData,
  hidden,
  playMode = false,
}: CrosswordGridProps) {
  const [cellSize, setCellSize] = useState(40);
  const [ratio, setRatio] = useState(1);
  const isHidden = hidden || playMode;
  const readMode = !playMode;

  console.log("crosswordData:", crosswordData);

  // Récupération des zones cliquables
  // Récupération des coordonnées entières des mots
  const wordsCoords = crosswordData.words.map((word) => {
    const { position, word: w, direction, definition } = word;
    const start = position;
    if (start?.x && start?.y) {
      const end =
        direction === "horizontal"
          ? { x: start.x + w.length - 1, y: start.y }
          : { x: start.x, y: start.y + w.length - 1 };
      return { start, end, word, definition };
    }
  });

  console.log("wordsCoords:", wordsCoords);

  useEffect(() => {
    // Ajuster la taille des cellules en fonction de la taille de la grille
    const maxSize = Math.max(crosswordData.width, crosswordData.height);
    const newSize = Math.min(40, Math.max(20, 600 / maxSize));
    const r = newSize / cellSize;
    setCellSize(newSize);
    setRatio(r);
  }, [crosswordData.width, crosswordData.height]);

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        minWidth: crosswordData.width * cellSize + 2,
        minHeight: crosswordData.height * cellSize + 2,
      }}
    >
      <div className="relative">
        {/* Grille de fond */}
        <div
          className="grid border border-gray-300"
          style={{
            gridTemplateColumns: `repeat(${crosswordData.width}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${crosswordData.height}, ${cellSize}px)`,
          }}
        >
          {Array.from({ length: crosswordData.height }).map((_, y) =>
            Array.from({ length: crosswordData.width }).map((_, x) => {
              const cellValue = crosswordData.grid[y][x];

              // Trouver si la cellule contient une définition
              const definitionCell = crosswordData.definitionCells.find(
                (cell) => cell.x === x && cell.y === y
              );

              return (
                <div
                  key={`${x}-${y}`}
                  className={`
                    flex items-center justify-center border border-gray-300 relative text-center
                    ${
                      definitionCell
                        ? "bg-amber-100"
                        : cellValue
                        ? "bg-white"
                        : "bg-gray-200"
                    }
                  `}
                  style={{ width: cellSize, height: cellSize }}
                >
                  {definitionCell ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[8px] sm:text-[10px] p-0.5 overflow-hidden">
                      <div className="absolute top-0 right-0">
                        {definitionCell.direction === "horizontal" ? (
                          <ArrowRight size={cellSize / 4} />
                        ) : (
                          <ArrowDown size={cellSize / 4} />
                        )}
                      </div>
                      <div
                        className="w-full line-clamp-4 text-center pt-1"
                        style={{ fontSize: 6 * ratio }}
                      >
                        {definitionCell.definition}
                      </div>
                    </div>
                  ) : (
                    cellValue && (
                      <>
                        {readMode ? (
                          <span className="select-none font-medium">
                            {!isHidden && cellValue}
                          </span>
                        ) : (
                          <input
                            type="text"
                            maxLength={1}
                            autoComplete="off"
                            className="w-full h-full text-center bg-transparent outline-none"
                          />
                        )}
                      </>
                    )
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function ArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="rotate-45"
    >
      <path d="m5 19 14-14" />
      <path d="m12 5h7v7" />
    </svg>
  );
}

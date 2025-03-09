import type { Word, CrosswordData } from "@/components/crossword-generator"

type GridCell = string | null
type Grid = GridCell[][]
type Position = { x: number; y: number }
type Placement = {
  word: Word
  position: Position
  direction: "horizontal" | "vertical"
}

export function generateCrossword(words: Word[]): CrosswordData {
  // Tri des mots par longueur décroissante pour placer les plus longs en premier
  const sortedWords = [...words].sort((a, b) => b.word.length - a.word.length)

  // Initialiser une grille de taille suffisante
  const maxWordLength = sortedWords[0].word.length
  const initialSize = Math.max(20, Math.ceil(Math.sqrt(sortedWords.length * 3)))

  const grid: Grid = createEmptyGrid(initialSize, initialSize)
  const placements: Placement[] = []
  const definitionCells: CrosswordData["definitionCells"] = []

  // Placer le premier mot au milieu de la grille horizontalement
  const firstWord = sortedWords[0]
  const midY = Math.floor(initialSize / 2)
  const midX = Math.floor((initialSize - firstWord.word.length) / 2)

  placeWordOnGrid(grid, firstWord.word, { x: midX, y: midY }, "horizontal")

  placements.push({
    word: firstWord,
    position: { x: midX, y: midY },
    direction: "horizontal",
  })

  // Définition pour le premier mot
  definitionCells.push({
    x: midX - 1,
    y: midY,
    definition: firstWord.definition,
    direction: "horizontal",
  })

  // Essayer de placer les mots restants
  const remainingWords = sortedWords.slice(1)

  for (const word of remainingWords) {
    const result = findBestPlacement(grid, word, placements)

    if (result) {
      const { position, direction, definitionPosition } = result

      placeWordOnGrid(grid, word.word, position, direction)

      placements.push({
        word,
        position,
        direction,
      })

      definitionCells.push({
        x: definitionPosition.x,
        y: definitionPosition.y,
        definition: word.definition,
        direction,
      })
    }
  }

  // Optimiser la taille de la grille en supprimant les lignes et colonnes vides
  const optimizedGrid = optimizeGrid(grid)
  const { trimmedGrid, offsetX, offsetY } = optimizedGrid

  // Mettre à jour les positions des placements et des définitions
  const updatedPlacements = placements.map((placement) => ({
    ...placement,
    position: {
      x: placement.position.x - offsetX,
      y: placement.position.y - offsetY,
    },
  }))

  const updatedDefinitionCells = definitionCells.map((cell) => ({
    ...cell,
    x: cell.x - offsetX,
    y: cell.y - offsetY,
  }))

  // Construire le résultat final
  return {
    grid: trimmedGrid,
    words: updatedPlacements.map((p) => ({
      ...p.word,
      direction: p.direction,
      position: p.position,
    })),
    width: trimmedGrid[0].length,
    height: trimmedGrid.length,
    definitionCells: updatedDefinitionCells,
  }
}

function createEmptyGrid(width: number, height: number): Grid {
  return Array(height)
    .fill(null)
    .map(() => Array(width).fill(null))
}

function placeWordOnGrid(grid: Grid, word: string, position: Position, direction: "horizontal" | "vertical"): void {
  const { x, y } = position

  for (let i = 0; i < word.length; i++) {
    if (direction === "horizontal") {
      grid[y][x + i] = word[i]
    } else {
      grid[y + i][x] = word[i]
    }
  }
}

function canPlaceWord(
  grid: Grid,
  word: string,
  position: Position,
  direction: "horizontal" | "vertical",
  placements: Placement[], // Pass placements as argument
): boolean {
  const { x, y } = position
  const height = grid.length
  const width = grid[0].length

  // Vérifier que le mot ne sort pas de la grille
  if (
    (direction === "horizontal" && x + word.length > width) ||
    (direction === "vertical" && y + word.length > height) ||
    x < 0 ||
    y < 0
  ) {
    return false
  }

  let hasIntersection = false

  for (let i = 0; i < word.length; i++) {
    const currentX = direction === "horizontal" ? x + i : x
    const currentY = direction === "vertical" ? y + i : y
    const currentCell = grid[currentY][currentX]

    // Vérifier les cases adjacentes (sauf aux intersections)
    const hasHorizontalNeighbor =
      (direction === "horizontal" &&
        ((currentX > 0 && grid[currentY][currentX - 1] !== null && i === 0) ||
          (currentX < width - 1 && grid[currentY][currentX + 1] !== null && i === word.length - 1))) ||
      (direction === "vertical" &&
        ((currentX > 0 && grid[currentY][currentX - 1] !== null) ||
          (currentX < width - 1 && grid[currentY][currentX + 1] !== null)))

    const hasVerticalNeighbor =
      (direction === "vertical" &&
        ((currentY > 0 && grid[currentY - 1][currentX] !== null && i === 0) ||
          (currentY < height - 1 && grid[currentY + 1][currentX] !== null && i === word.length - 1))) ||
      (direction === "horizontal" &&
        ((currentY > 0 && grid[currentY - 1][currentX] !== null) ||
          (currentY < height - 1 && grid[currentY + 1][currentX] !== null)))

    // Si la case est déjà occupée
    if (currentCell !== null) {
      // Le mot doit s'intersecter correctement
      if (currentCell !== word[i]) {
        return false
      }
      hasIntersection = true
    } else if (hasHorizontalNeighbor || hasVerticalNeighbor) {
      // Si une case adjacente est occupée (sauf aux intersections), c'est invalide
      return false
    }
  }

  // Vérifier que la case avant et après le mot est vide
  if (direction === "horizontal") {
    if (x > 0 && grid[y][x - 1] !== null) {
      return false
    }
    if (x + word.length < width && grid[y][x + word.length] !== null) {
      return false
    }
  } else {
    if (y > 0 && grid[y - 1][x] !== null) {
      return false
    }
    if (y + word.length < height && grid[y + word.length][x] !== null) {
      return false
    }
  }

  // Le mot doit avoir au moins une intersection avec les mots existants
  return hasIntersection || placements.length === 0
}

function findBestPlacement(
  grid: Grid,
  word: Word,
  placements: Placement[],
): { position: Position; direction: "horizontal" | "vertical"; definitionPosition: Position } | null {
  if (placements.length === 0) {
    return null
  }

  const height = grid.length
  const width = grid[0].length
  const wordStr = word.word

  let bestScore = -1
  let bestPlacement = null

  // Essayer de placer le mot en s'intersectant avec les mots existants
  for (const placement of placements) {
    const { word: existingWord, position: existingPosition, direction: existingDirection } = placement

    for (let i = 0; i < existingWord.word.length; i++) {
      const existingChar = existingWord.word[i]

      // Trouver toutes les occurrences de ce caractère dans le nouveau mot
      for (let j = 0; j < wordStr.length; j++) {
        if (wordStr[j] !== existingChar) {
          continue
        }

        // Calculer la position potentielle
        let newPosition: Position
        let newDirection: "horizontal" | "vertical"

        if (existingDirection === "horizontal") {
          newPosition = {
            x: existingPosition.x + i,
            y: existingPosition.y - j,
          }
          newDirection = "vertical"
        } else {
          newPosition = {
            x: existingPosition.x - j,
            y: existingPosition.y + i,
          }
          newDirection = "horizontal"
        }

        // Vérifier si le placement est valide
        if (canPlaceWord(grid, wordStr, newPosition, newDirection, placements)) {
          // Calculer un score pour ce placement
          const score = calculatePlacementScore(grid, wordStr, newPosition, newDirection)

          if (score > bestScore) {
            // Calculer la position de la définition
            let definitionPosition: Position

            if (newDirection === "horizontal") {
              definitionPosition = {
                x: newPosition.x - 1,
                y: newPosition.y,
              }
            } else {
              definitionPosition = {
                x: newPosition.x,
                y: newPosition.y - 1,
              }
            }

            // Vérifier que la position de la définition est valide
            if (
              definitionPosition.x >= 0 &&
              definitionPosition.y >= 0 &&
              definitionPosition.x < width &&
              definitionPosition.y < height &&
              grid[definitionPosition.y][definitionPosition.x] === null
            ) {
              bestScore = score
              bestPlacement = {
                position: newPosition,
                direction: newDirection,
                definitionPosition,
              }
            }
          }
        }
      }
    }
  }

  return bestPlacement
}

function calculatePlacementScore(
  grid: Grid,
  word: string,
  position: Position,
  direction: "horizontal" | "vertical",
): number {
  let score = 0
  const { x, y } = position

  // Préférer les placements avec plus d'intersections
  for (let i = 0; i < word.length; i++) {
    const currentX = direction === "horizontal" ? x + i : x
    const currentY = direction === "vertical" ? y + i : y

    if (grid[currentY][currentX] !== null) {
      score += 10
    }
  }

  // Préférer les placements proches du centre
  const centerX = Math.floor(grid[0].length / 2)
  const centerY = Math.floor(grid.length / 2)
  const distanceFromCenter = Math.abs(x - centerX) + Math.abs(y - centerY)
  score -= distanceFromCenter

  return score
}

function optimizeGrid(grid: Grid): { trimmedGrid: Grid; offsetX: number; offsetY: number } {
  const height = grid.length
  const width = grid[0].length

  // Trouver les limites de la grille utilisée
  let minX = width
  let maxX = 0
  let minY = height
  let maxY = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] !== null) {
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
    }
  }

  // Ajouter une marge de 1 pour les définitions
  minX = Math.max(0, minX - 1)
  minY = Math.max(0, minY - 1)
  maxX = Math.min(width - 1, maxX + 1)
  maxY = Math.min(height - 1, maxY + 1)

  // Extraire la sous-grille optimisée
  const trimmedGrid: Grid = []

  for (let y = minY; y <= maxY; y++) {
    const row: GridCell[] = []
    for (let x = minX; x <= maxX; x++) {
      row.push(grid[y][x])
    }
    trimmedGrid.push(row)
  }

  return {
    trimmedGrid,
    offsetX: minX,
    offsetY: minY,
  }
}


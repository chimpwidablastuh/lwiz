"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2 } from "lucide-react"
import type { Word } from "@/components/crossword-generator"

interface WordListProps {
  words: Word[]
  onRemoveWord: (id: string) => void
}

export function WordList({ words, onRemoveWord }: WordListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredWords = searchTerm
    ? words.filter(
        (word) =>
          word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
          word.definition.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : words

  return (
    <div className="space-y-4">
      <Input
        placeholder="Rechercher un mot ou une définition..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />

      {filteredWords.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mot</TableHead>
                <TableHead className="w-full">Définition</TableHead>
                <TableHead className="w-[80px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWords.map((word) => (
                <TableRow key={word.id}>
                  <TableCell className="font-medium">{word.word}</TableCell>
                  <TableCell>{word.definition}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveWord(word.id)}
                      aria-label={`Supprimer ${word.word}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">
            {searchTerm
              ? "Aucun mot ne correspond à votre recherche"
              : "Aucun mot n'a été ajouté. Commencez par ajouter des mots."}
          </p>
        </div>
      )}
    </div>
  )
}


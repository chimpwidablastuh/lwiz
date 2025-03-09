"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WordList } from "@/components/word-list";
import { CrosswordGrid } from "@/components/crossword-grid";
import { Textarea } from "@/components/ui/textarea";
import { generateCrossword } from "@/lib/crossword-algorithm";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export type Word = {
  id: string;
  word: string;
  definition: string;
  direction?: "horizontal" | "vertical";
  position?: { x: number; y: number };
};

export type CrosswordData = {
  grid: (string | null)[][];
  words: Word[];
  width: number;
  height: number;
  definitionCells: {
    x: number;
    y: number;
    definition: string;
    direction: "horizontal" | "vertical";
  }[];
};

export function CrosswordGenerator() {
  const [words, setWords] = useState<Word[]>([]);
  const [newWord, setNewWord] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [wordInput, setWordInput] = useState("");
  const [crosswordData, setCrosswordData] = useState<CrosswordData | null>(
    null
  );
  const { toast } = useToast();
  const crosswordRef = useRef<HTMLDivElement>(null);

  const handleAddWord = () => {
    if (newWord.trim() === "" || newDefinition.trim() === "") {
      toast({
        title: "Erreur",
        description: "Le mot et la définition sont requis.",
        variant: "destructive",
      });
      return;
    }

    const wordToAdd = newWord.trim().toUpperCase();

    // Vérifier si le mot existe déjà
    if (words.some((w) => w.word === wordToAdd)) {
      toast({
        title: "Mot déjà existant",
        description: "Ce mot existe déjà dans la liste.",
        variant: "destructive",
      });
      return;
    }

    setWords([
      ...words,
      {
        id: Date.now().toString(),
        word: wordToAdd,
        definition: newDefinition.trim(),
      },
    ]);
    setNewWord("");
    setNewDefinition("");
  };

  const handleBulkAddWords = () => {
    if (!wordInput.trim()) {
      toast({
        title: "Entrée vide",
        description: "Veuillez saisir des mots et définitions.",
        variant: "destructive",
      });
      return;
    }

    const lines = wordInput.trim().split("\n");
    const newWords: Word[] = [];
    let hasErrors = false;

    lines.forEach((line) => {
      const parts = line.split(":");
      if (parts.length !== 2) {
        hasErrors = true;
        return;
      }

      const word = parts[0].trim().toUpperCase();
      const definition = parts[1].trim();

      if (word && definition && !words.some((w) => w.word === word)) {
        newWords.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          word,
          definition,
        });
      }
    });

    if (hasErrors) {
      toast({
        title: "Format incorrect",
        description: "Format attendu: MOT: DÉFINITION (une paire par ligne)",
        variant: "destructive",
      });
    }

    if (newWords.length > 0) {
      setWords([...words, ...newWords]);
      setWordInput("");
      toast({
        title: "Mots ajoutés",
        description: `${newWords.length} mot(s) ajouté(s) avec succès.`,
      });
    }
  };

  const handleRemoveWord = (id: string) => {
    setWords(words.filter((word) => word.id !== id));
  };

  const handleGenerateCrossword = () => {
    if (words.length < 5) {
      toast({
        title: "Pas assez de mots",
        description: "Ajoutez au moins 5 mots pour générer une grille.",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = generateCrossword(words);
      setCrosswordData(data);
      toast({
        title: "Grille générée",
        description: "La grille a été générée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          "Impossible de générer la grille. Essayez avec d'autres mots.",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = async () => {
    if (!crosswordRef.current || !crosswordData) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord générer une grille.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Exportation en cours",
      description: "Préparation du fichier PDF...",
    });

    try {
      const canvas = await html2canvas(crosswordRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      // Déterminer l'orientation en fonction des dimensions
      const isLandscape = canvas.width > canvas.height;

      const pdf = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "mm",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = (pdfHeight - imgHeight * ratio) / 2;

      pdf.addImage(
        imgData,
        "JPEG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );
      pdf.save("mots-fleches.pdf");

      toast({
        title: "Exportation réussie",
        description: "Le fichier a été téléchargé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur d'exportation",
        description: "Impossible d'exporter la grille en PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <Tabs defaultValue="words" className="space-y-6">
      <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
        <TabsTrigger value="words">Mots</TabsTrigger>
        <TabsTrigger value="generate">Générer</TabsTrigger>
        <TabsTrigger value="export" disabled={!crosswordData}>
          Exporter
        </TabsTrigger>
      </TabsList>

      <TabsContent value="words">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="word">Mot</Label>
                <Input
                  id="word"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Entrez un mot"
                />
              </div>
              <div>
                <Label htmlFor="definition">Définition</Label>
                <Input
                  id="definition"
                  value={newDefinition}
                  onChange={(e) => setNewDefinition(e.target.value)}
                  placeholder="Entrez une définition"
                />
              </div>
              <Button onClick={handleAddWord}>Ajouter le mot</Button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Label htmlFor="bulk">
                Ajout en lot (MOT: DÉFINITION, un par ligne)
              </Label>
              <Textarea
                id="bulk"
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                placeholder="CHAT: Félin domestique&#10;MAISON: Lieu d'habitation&#10;JARDIN: Espace cultivé"
                className="min-h-[150px] mt-2"
              />
              <Button onClick={handleBulkAddWords} className="mt-2">
                Ajouter en lot
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Liste des mots ({words.length})
          </h2>
          <WordList words={words} onRemoveWord={handleRemoveWord} />
        </div>
      </TabsContent>

      <TabsContent value="generate">
        <Card className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold">Générer la grille</h2>
            <p className="text-gray-500 mt-2">
              {words.length < 5
                ? `Ajoutez au moins 5 mots pour générer une grille (${words.length}/5)`
                : `${words.length} mots disponibles pour la génération`}
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <Button
              size="lg"
              onClick={handleGenerateCrossword}
              disabled={words.length < 5}
              className="px-8"
            >
              Générer la grille
            </Button>
          </div>

          {crosswordData && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-medium mb-4 text-center">
                Aperçu de la grille
              </h3>
              <div className="overflow-auto max-h-[500px] border rounded-lg p-4">
                <CrosswordGrid crosswordData={crosswordData} />
              </div>
            </div>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="export">
        <Card className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold">Exporter la grille</h2>
            <p className="text-gray-500 mt-2">
              Visualisez et exportez votre grille de mots fléchés
            </p>
          </div>

          {crosswordData && (
            <>
              <div className="flex justify-center mb-6">
                <Button size="lg" onClick={handleExportPDF} className="px-8">
                  Exporter en PDF
                </Button>
              </div>

              <div className="mt-4 border rounded-lg p-4" ref={crosswordRef}>
                <CrosswordGrid crosswordData={crosswordData} />
              </div>
            </>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  );
}

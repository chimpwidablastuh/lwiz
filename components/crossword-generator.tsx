"use client";

import { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WordList } from "@/components/word-list";
import { CrosswordGrid } from "@/components/crossword-grid";
import { generateCrossword } from "@/lib/crossword-algorithm";
import { useToast } from "@/hooks/use-toast";
import { words as mocks } from "@/mocks/words";
import { ExportPDFButton, PublishButton } from "./buttons";
import { publishGrid } from "@/actions/publish";
import { useFingerprint } from "@/lib/fingerprint";
import { Grid } from "@prisma/client";

export interface CrosswordGeneratorProps {
  initialGrid?: Grid;
}

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

export function CrosswordGenerator({ initialGrid }: CrosswordGeneratorProps) {
  const playMode = !!initialGrid;
  const createMode = !playMode;
  const fingerprint = useFingerprint();
  const [words, setWords] = useState<Word[]>(
    initialGrid?.words?.map((w: any) => ({
      id: w.word,
      word: w.word,
      definition: w.clue,
    })) || []
  );
  const [newWord, setNewWord] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  // const [wordInput, setWordInput] = useState("");
  const [hiddenMode, setHiddenMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"words" | "export">("words");
  const [crosswordData, setCrosswordData] = useState<CrosswordData | null>(
    null
  );
  const [pdfLoading, setPdfLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishedGrid, setPublishedGrid] = useState<Grid | null>(null);
  const { toast } = useToast();
  const crosswordRef = useRef<HTMLDivElement>(null);

  // Mise à jour de la grille si les mots changent
  useEffect(() => {
    if (words.length >= 5) {
      handleGenerateCrossword();
    }
  }, [words]);

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
    } catch {
      toast({
        title: "Erreur",
        description:
          "Impossible de générer la grille. Essayez avec d'autres mots.",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = async () => {
    setHiddenMode(true);
    setPdfLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (!crosswordRef.current || !crosswordData) {
      console.log("triggered inside");
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
      console.log("ici ça trigger mon con");
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
      console.log("error", error);
      toast({
        title: "Erreur d'exportation",
        description: "Impossible d'exporter la grille en PDF.",
        variant: "destructive",
      });
    }
    setHiddenMode(false);
    setPdfLoading(false);
  };

  function onSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    handleAddWord();
  }

  async function onPublish() {
    setPublishLoading(true);
    const grid = await publishGrid({
      identifier: fingerprint || "",
      words: words.map((w) => ({ word: w.word, clue: w.definition })),
    });

    if (grid.grid) setPublishedGrid(grid.grid);

    setPublishLoading(false);
  }

  return (
    <Tabs
      defaultValue={createMode ? "words" : "export"}
      value={selectedTab}
      className="space-y-6"
    >
      <TabsList
        className={
          createMode
            ? "grid grid-cols-2 w-full max-w-md mx-auto"
            : "grid grid-cols-1 w-full max-w-xs mx-auto"
        }
      >
        {createMode && (
          <TabsTrigger value="words" onClick={() => setSelectedTab("words")}>
            Créer
          </TabsTrigger>
        )}
        <TabsTrigger
          value="export"
          disabled={words.length < 5}
          onClick={() => setSelectedTab("export")}
        >
          {playMode ? "Jouer" : "Partager"}
        </TabsTrigger>
      </TabsList>

      {createMode && (
        <TabsContent value="words">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="grid gap-4">
                <form
                  onSubmit={onSubmitForm}
                  onKeyDown={(e) => e.key === "Enter" && onSubmitForm(e)}
                >
                  <div>
                    <Label htmlFor="word">Mot</Label>
                    <Input
                      className="mt-2"
                      id="word"
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value)}
                      placeholder="Mot à deviner"
                    />
                  </div>
                  <div>
                    <Label htmlFor="definition" className="mt-4">
                      Définition
                    </Label>
                    <Input
                      className="mt-2"
                      id="definition"
                      maxLength={20}
                      value={newDefinition}
                      onChange={(e) => setNewDefinition(e.target.value)}
                      placeholder="Saisir indice (20 lettres max)"
                    />
                  </div>
                </form>
                <Button onClick={handleAddWord}>Ajouter le mot</Button>
                <Button
                  onClick={() => setSelectedTab("export")}
                  disabled={words.length < 5}
                >
                  Voir la grille
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
      )}

      <TabsContent value="export">
        <Card className="p-6">
          {createMode && (
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold">Exporter la grille</h2>
              <p className="text-gray-500 mt-2">
                Visualisez et exportez votre grille de mots fléchés
              </p>
            </div>
          )}

          {crosswordData && (
            <>
              <div className="flex justify-center mb-6">
                <ExportPDFButton
                  onClick={handleExportPDF}
                  loading={pdfLoading}
                />
                {createMode && (
                  <PublishButton onClick={onPublish} loading={publishLoading} />
                )}
              </div>

              <div className="mt-4 border rounded-lg p-4" ref={crosswordRef}>
                <CrosswordGrid
                  crosswordData={crosswordData}
                  hidden={hiddenMode || !createMode}
                />
              </div>
            </>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  );
}

import Squares from "@/components/backgrounds/Squares/Squares";
import { CrosswordGenerator } from "@/components/crossword-generator";
import Lwiz from "@/components/logo";

export default function Home() {
  return (
    <>
      <Squares
        speed={0.5}
        squareSize={60}
        direction="diagonal" // up, down, left, right, diagonal
        borderColor="#000"
        hoverFillColor="#222"
      />
      <main className="min-h-screen p-6 md:p-12 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <Lwiz />
          <p className="text-center mb-8 text-gray-600">
            Créez vos propres mots fléchés et partagez-les avec vos amis.
          </p>
          <CrosswordGenerator />
        </div>
      </main>
    </>
  );
}

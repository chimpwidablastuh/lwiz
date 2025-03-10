import Squares from "@/components/backgrounds/Squares/Squares";
import { CrosswordGenerator } from "@/components/crossword-generator";
import Lwiz from "@/components/logo";
import { Typewriter } from "@/components/typewriter";

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
            Le premier générateur de mots fléchés permettant de réconcilier
            ensemble les mots{" "}
            <Typewriter
              pauseDuration={500}
              fontSize={20}
              words={[
                "gecko",
                "gorille",
                "amour",
                "passion",
                "éternité",
                "confiance",
                "courage",
                "bonheur",
              ]}
            />{" "}
            dans un même référentiel.
          </p>
          <CrosswordGenerator />
        </div>
      </main>
    </>
  );
}

import Squares from "@/components/backgrounds/Squares/Squares";
import { CrosswordGenerator } from "@/components/crossword-generator";
import SplitText from "@/components/textanimations/SplitText/SplitText";

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
          <h1 className="text-8xl font-bold text-center mb-6">
            <SplitText
              text="Lwiz."
              className="text-center"
              delay={150}
              animationFrom={{ opacity: 0, transform: "translate3d(0,50px,0)" }}
              animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
              threshold={0.2}
              rootMargin="-50px"
            />
          </h1>
          <p className="text-center mb-8 text-gray-600">
            Créez vos propres mots fléchés et partagez-les avec vos amis.
          </p>
          <CrosswordGenerator />
        </div>
      </main>
    </>
  );
}

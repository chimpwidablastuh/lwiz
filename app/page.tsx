import { CrosswordGenerator } from "@/components/crossword-generator";
import { Typewriter } from "@/components/typewriter";

export default function Home() {
  return (
    <main className="min-h-screen p-6 md:p-12 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">
          <Typewriter text="Générateur de mots fléchés" />
        </h1>
        <p className="text-center mb-8 text-gray-600">
          Créez facilement des grilles de mots fléchés personnalisées et
          exportez-les en PDF
        </p>
        <CrosswordGenerator />
      </div>
    </main>
  );
}

import { prisma } from "@/prisma/client";
import Squares from "@/components/backgrounds/Squares/Squares";
import { CrosswordGenerator } from "@/components/crossword-generator";
import Lwiz from "@/components/logo";

interface PageProps {
  params: Promise<{ gridId: string }>;
}

export default async function GridDisplay({ params }: PageProps) {
  const { gridId } = await params;
  const grid = await prisma.grid.findFirst({ where: { id: gridId } });

  console.log(grid);

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
          {grid && <CrosswordGenerator initialGrid={grid} />}
        </div>
      </main>
    </>
  );
}

"use server";
import md5 from "md5";
import { Word, Grid } from "@prisma/client";
import { prisma } from "@/prisma/client";

export interface PublishGridParams {
  identifier: string;
  words: Word[];
}

export interface PublishGridResponse {
  success: boolean;
  grid: Grid | undefined;
}

export interface UpdateGridParams {
  id: number;
  words: Word[];
  identifier: string;
}

export interface UpdateGridResponse {
  success: boolean;
  grid: Grid | undefined;
}

export async function publishGrid({
  words,
  identifier,
}: PublishGridParams): Promise<PublishGridResponse> {
  try {
    const hash = md5(JSON.stringify(words) + "-" + identifier);
    // Check if exists
    const existingGrid = await prisma.grid.findFirst({
      where: { hash },
    });

    if (existingGrid) {
      return { success: true, grid: existingGrid };
    }

    const grid = await prisma.grid.create({
      data: {
        hash,
        createdBy: identifier,
        words,
      },
    });

    return { success: !!grid.id, grid: !!grid.id ? grid : undefined };
  } catch (error) {
    console.error("Erreur lors de la publication de la grille:", error);
    return { success: false, grid: undefined };
  }
}

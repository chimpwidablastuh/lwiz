"use client";

import { Button } from "@/components/ui/button";
import { FileText, Upload, Loader2 } from "lucide-react";

interface ButtonProps {
  onClick?: (params?: any) => void;
  loading?: boolean;
}

export function PublishButton({ onClick, loading = false }: ButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className="bg-black hover:bg-gray-800 text-white rounded-md px-6 py-2 flex items-center gap-2 h-10 ml-4"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Upload className="h-4 w-4" />
      )}
      {loading ? "Publication..." : "Publier"}
    </Button>
  );
}

export function ExportPDFButton({ onClick, loading = false }: ButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className="bg-black hover:bg-gray-800 text-white rounded-md px-6 py-2 flex items-center gap-2 h-10"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      {loading ? "Export en cours..." : "Exporter en PDF"}
    </Button>
  );
}

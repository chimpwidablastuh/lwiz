"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Copy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageStripProps {
  text: string;
  lien: string;
  className?: string;
  onClose?: () => void;
}

export default function MessageStrip({
  text,
  lien,
  className,
  onClose,
}: MessageStripProps) {
  const [visible, setVisible] = useState(true);

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(lien)
      .then(() => {
        alert("Lien copié !");
      })
      .catch((err) => {
        console.error("Erreur lors de la copie du lien:", err);
      });
  };

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between p-4 mb-4 border rounded-lg bg-green-50 border-green-200",
        className
      )}
    >
      <div className="flex items-center mb-2 sm:mb-0">
        <AlertCircle className="h-5 w-5 text-green-500 mr-2" />
        <span className="text-green-700 font-medium">{text}</span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-green-500 text-green-700 hover:bg-green-100"
          onClick={() => window.open(lien, "_blank")}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          VOIR
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-green-500 text-green-700 hover:bg-green-100"
          onClick={handleCopyLink}
        >
          <Copy className="h-4 w-4 mr-1" />
          PARTAGER
        </Button>
      </div>
    </div>
  );
}

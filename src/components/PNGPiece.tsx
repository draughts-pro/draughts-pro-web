import blackKing from "@/assets/black-king.png";
import blackPiece from "@/assets/black.png";
import whiteKing from "@/assets/white-king.png";
import whitePiece from "@/assets/white.png";
import React from "react";

interface PNGPieceProps {
  color: "light" | "dark";
  isKing: boolean;
}

const PNGPiece: React.FC<PNGPieceProps> = ({ color, isKing }) => {
  const getImageSrc = () => {
    if (color === "dark") {
      return isKing ? blackKing : blackPiece;
    } else {
      return isKing ? whiteKing : whitePiece;
    }
  };

  return (
    <img
      src={getImageSrc()}
      alt={`${color} ${isKing ? "king" : "piece"}`}
      className="w-full h-full object-contain"
    />
  );
};

export default PNGPiece;

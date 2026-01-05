import React from "react";
import PNGPiece from "./PNGPiece";

interface PieceProps {
  color: "dark" | "light";
  isKing: boolean;
}

const Piece: React.FC<PieceProps> = ({ color, isKing }) => {
  return (
    <div className="w-full h-full p-1 cursor-pointer">
      <PNGPiece color={color} isKing={isKing} />
    </div>
  );
};

export default Piece;

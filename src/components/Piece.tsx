import React from "react";
import { Crown } from "./ui/icons";

interface PieceProps {
  color: "dark" | "light";
  isKing: boolean;
  lifted?: boolean;
  dragging?: boolean;
  captured?: boolean;
  crowned?: boolean;
  slide?: { dx: number; dy: number; hop: boolean } | null;
}

/** Glossy pearl / onyx disc with a turned ring, an edge and a soft shadow. */
const Piece: React.FC<PieceProps> = ({ color, isKing, lifted, dragging, captured, crowned, slide }) => {
  const style = slide
    ? ({ "--dx": slide.dx, "--dy": slide.dy } as React.CSSProperties)
    : undefined;

  return (
    <span
      className={`piece piece--${color}`}
      data-king={isKing || undefined}
      data-lifted={lifted || undefined}
      data-dragging={dragging || undefined}
      data-captured={captured || undefined}
      data-crowned={crowned || undefined}
      data-slide={slide ? (slide.hop ? "hop" : "slide") : undefined}
      style={style}
      aria-hidden
    >
      <span className="piece-shadow" />
      <span className="piece-body">
        <span className="piece-edge" />
        <span className="piece-face" />
        {isKing && <Crown className="piece-crown" />}
      </span>
      {crowned && <span className="crown-flash" />}
    </span>
  );
};

export const MiniPiece: React.FC<{ color: "dark" | "light"; isKing?: boolean; size?: number }> = ({
  color,
  isKing = false,
  size = 22,
}) => (
  <span className="piece-mini" style={{ "--size": `${size}px` } as React.CSSProperties}>
    <Piece color={color} isKing={isKing} />
  </span>
);

export default Piece;

import { useAtomValue, useSetAtom } from "jotai";
import React from "react";
import {
  movePieceActionAtom,
  selectPieceActionAtom,
} from "../pages/game/actions";
import { positionsEqual } from "../pages/game/board";
import {
  boardAtom,
  currentTurnAtom,
  gameModeAtom,
  hintMoveAtom,
  isAiThinkingAtom,
  lastMoveAtom,
  selectedPieceAtom,
  validMovesAtom,
} from "../pages/game/state";
import Piece from "./Piece";

const Board: React.FC = () => {
  const board = useAtomValue(boardAtom);
  const selectedPiece = useAtomValue(selectedPieceAtom);
  const validMoves = useAtomValue(validMovesAtom);
  const isAiThinking = useAtomValue(isAiThinkingAtom);
  const gameMode = useAtomValue(gameModeAtom);
  const currentTurn = useAtomValue(currentTurnAtom);
  const lastMove = useAtomValue(lastMoveAtom);
  const hintMove = useAtomValue(hintMoveAtom);
  const selectPiece = useSetAtom(selectPieceActionAtom);
  const movePiece = useSetAtom(movePieceActionAtom);

  const boardSize = board.length;

  const handleSquareClick = (row: number, col: number) => {
    if (isAiThinking) return;
    if (gameMode === "ai" && currentTurn === "dark") return;

    const piece = board[row][col];

    const isValidMove = validMoves.some(
      (move) => move.row === row && move.col === col
    );
    if (isValidMove && selectedPiece) {
      movePiece({ row, col });
      return;
    }

    if (piece) {
      selectPiece({ row, col });
    } else {
      selectPiece({ row, col });
    }
  };

  const squares = [];
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const isDarkSquare = (row + col) % 2 === 1;
      const piece = board[row][col];
      const isSelected = positionsEqual(selectedPiece, { row, col });
      const isValidMove = validMoves.some(
        (move) => move.row === row && move.col === col
      );
      const isLastMoveFrom =
        lastMove && positionsEqual(lastMove.from, { row, col });
      const isLastMoveTo =
        lastMove && positionsEqual(lastMove.to, { row, col });
      const isHintFrom = hintMove && positionsEqual(hintMove.from, { row, col });
      const isHintTo = hintMove && positionsEqual(hintMove.to, { row, col });

      let squareColor = isDarkSquare ? "bg-board-dark" : "bg-board-light";
      if (isSelected) {
        squareColor += " ring-4 ring-accent-blue ring-inset";
      }
      if (isLastMoveFrom || isLastMoveTo) {
        squareColor += " ring-4 ring-cyan-400 ring-inset";
      }
      if (isHintFrom || isHintTo) {
        squareColor += " ring-4 ring-purple-500 ring-inset animate-pulse";
      }
      if (isValidMove) {
        squareColor += " relative";
      }

      squares.push(
        <div
          key={`${row}-${col}`}
          className={`aspect-square flex items-center justify-center ${squareColor} ${
            isDarkSquare || piece ? "cursor-pointer" : ""
          }`}
          onClick={() => handleSquareClick(row, col)}
        >
          {piece && <Piece color={piece.color} isKing={piece.isKing} />}
          {isValidMove && (
            <div className="absolute w-4 h-4 bg-accent-green rounded-full opacity-70" />
          )}
        </div>
      );
    }
  }

  return (
    <div
      className="grid gap-0 rounded-lg overflow-hidden border-4 border-primary w-full h-full aspect-square"
      style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
    >
      {squares}
    </div>
  );
};

export default Board;

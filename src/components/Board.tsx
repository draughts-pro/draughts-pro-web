import { translationsAtom } from "@/i18n";
import { useAtomValue, useSetAtom } from "jotai";
import React, { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  movePieceActionAtom,
  selectPieceActionAtom,
} from "../pages/game/utils/actions";
import { positionsEqual } from "../pages/game/utils/board";
import { multiplayerGameStateAtom } from "../pages/game/utils/multiplayer-state";
import {
  boardAtom,
  currentTurnAtom,
  gameModeAtom,
  hintMoveAtom,
  isAiThinkingAtom,
  lastMoveAtom,
  selectedPieceAtom,
  validMovesAtom,
  type BoardState,
  type Piece as PieceType,
  type Position,
} from "../pages/game/utils/state";
import Piece from "./Piece";

type Move = { from: Position; to: Position };

/** Visual effects derived from the last move: which pieces were taken, promotion. */
type MoveFx = {
  id: number;
  move: Move;
  captured: { pos: Position; piece: PieceType }[];
  crowned: boolean;
  /** the player dragged the piece there, so it should not slide again */
  dropped?: boolean;
};

type Drag = {
  pointerId: number;
  from: Position;
  startX: number;
  startY: number;
  x: number;
  y: number;
  size: number;
  active: boolean;
  over: Position | null;
};

const deriveFx = (prev: BoardState, next: BoardState, move: Move, id: number): MoveFx => {
  const captured: MoveFx["captured"] = [];
  if (prev.length === next.length) {
    for (let r = 0; r < next.length; r++) {
      for (let c = 0; c < next.length; c++) {
        const before = prev[r][c];
        if (before && !next[r][c] && !positionsEqual(move.from, { row: r, col: c })) {
          captured.push({ pos: { row: r, col: c }, piece: before });
        }
      }
    }
  }
  const before = prev[move.from.row]?.[move.from.col];
  const after = next[move.to.row]?.[move.to.col];
  return { id, move, captured, crowned: Boolean(after?.isKing && before && !before.isKing) };
};

const Board: React.FC = () => {
  const board = useAtomValue(boardAtom);
  const selectedPiece = useAtomValue(selectedPieceAtom);
  const validMoves = useAtomValue(validMovesAtom);
  const isAiThinking = useAtomValue(isAiThinkingAtom);
  const gameMode = useAtomValue(gameModeAtom);
  const currentTurn = useAtomValue(currentTurnAtom);
  const lastMove = useAtomValue(lastMoveAtom);
  const hintMove = useAtomValue(hintMoveAtom);
  const multiplayerState = useAtomValue(multiplayerGameStateAtom);
  const t = useAtomValue(translationsAtom);
  const selectPiece = useSetAtom(selectPieceActionAtom);
  const movePiece = useSetAtom(movePieceActionAtom);

  const boardSize = board.length;
  const gridRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [droppedOn, setDroppedOn] = useState<Position | null>(null);

  // Keep the previous board to derive capture / promotion effects
  // ("adjusting state while rendering" pattern, no effects needed).
  const [snap, setSnap] = useState<{ board: BoardState; lastMove: Move | null; fx: MoveFx | null }>(
    { board, lastMove, fx: null }
  );
  if (snap.board !== board || snap.lastMove !== lastMove) {
    const fx =
      lastMove && lastMove !== snap.lastMove
        ? {
            ...deriveFx(snap.board, board, lastMove, (snap.fx?.id ?? 0) + 1),
            dropped: Boolean(droppedOn && positionsEqual(droppedOn, lastMove.to)),
          }
        : null;
    setSnap({ board, lastMove, fx });
    if (droppedOn) setDroppedOn(null);
  }
  const fx = snap.fx;

  // The playable colour is whichever parity the pieces stand on.
  const playableParity = useMemo(() => {
    for (let r = 0; r < board.length; r++)
      for (let c = 0; c < board.length; c++) if (board[r][c]) return (r + c) % 2;
    return 1;
  }, [board]);

  const myColor = multiplayerState.isMultiplayer ? multiplayerState.playerColor : "light";
  const canInteract =
    !isAiThinking &&
    !(!multiplayerState.isMultiplayer && gameMode === "ai" && currentTurn === "dark") &&
    !(multiplayerState.isMultiplayer && currentTurn !== multiplayerState.playerColor);

  const isTarget = (pos: Position) => validMoves.some((m) => positionsEqual(m, pos));

  const handleSquareClick = (row: number, col: number) => {
    if (isAiThinking) return;
    if (!multiplayerState.isMultiplayer && gameMode === "ai" && currentTurn === "dark") return;

    if (multiplayerState.isMultiplayer && currentTurn !== multiplayerState.playerColor) {
      return;
    }

    const isValidMove = isTarget({ row, col });
    if (isValidMove && selectedPiece) {
      movePiece({ row, col });
      return;
    }

    selectPiece({ row, col });
  };

  const shouldFlipBoard = multiplayerState.isMultiplayer && multiplayerState.playerColor === "dark";
  const dir = shouldFlipBoard ? -1 : 1;

  // ---- pointer: tap to select / tap to move, or drag a piece onto a target
  const squareAt = (x: number, y: number): Position | null => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-sq]");
    if (!el || !gridRef.current?.contains(el)) return null;
    const [row, col] = el.dataset.sq!.split("-").map(Number);
    return { row, col };
  };

  const onPointerDown = (e: React.PointerEvent, row: number, col: number) => {
    if (e.button !== 0) return;
    const piece = board[row][col];
    const own = piece && piece.color === currentTurn && canInteract;
    handleSquareClick(row, col);
    if (own) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      gridRef.current?.setPointerCapture(e.pointerId);
      setDrag({
        pointerId: e.pointerId,
        from: { row, col },
        startX: e.clientX,
        startY: e.clientY,
        x: e.clientX,
        y: e.clientY,
        size: rect.width,
        active: false,
        over: null,
      });
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const moved = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);
    const active = drag.active || moved > Math.max(8, drag.size * 0.2);
    setDrag({ ...drag, x: e.clientX, y: e.clientY, active, over: active ? squareAt(e.clientX, e.clientY) : null });
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    if (drag.active) {
      const over = squareAt(e.clientX, e.clientY);
      if (over && !positionsEqual(over, drag.from) && isTarget(over)) {
        setDroppedOn(over);
        movePiece(over);
      }
    }
    setDrag(null);
  };

  const squares = [];
  let playableIndex = 0;
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const pos = { row, col };
      const isDarkSquare = (row + col) % 2 === playableParity;
      const piece = board[row][col];
      const isSelected = positionsEqual(selectedPiece, pos);
      const isValidMove = isTarget(pos);
      const isLast =
        lastMove && (positionsEqual(lastMove.from, pos) || positionsEqual(lastMove.to, pos));
      const isHint =
        hintMove && (positionsEqual(hintMove.from, pos) || positionsEqual(hintMove.to, pos));
      const landed = fx && positionsEqual(fx.move.to, pos) && piece;
      const ghost = fx?.captured.find((c) => positionsEqual(c.pos, pos));
      const isDragging = drag?.active && positionsEqual(drag.from, pos);
      const movable = canInteract && piece?.color === currentTurn && piece.color === myColor;
      if (isDarkSquare) playableIndex++;

      const label = isDarkSquare
        ? `${playableIndex}${piece ? `, ${piece.color === "light" ? t.lobby.light : t.lobby.dark}` : ""}`
        : undefined;

      const Tag = isDarkSquare ? "button" : "div";

      squares.push(
        <Tag
          key={`${row}-${col}`}
          data-sq={`${row}-${col}`}
          className={`sq ${isDarkSquare ? "sq--dark" : ""} ${isValidMove ? "sq-target" : ""}`}
          data-selected={isSelected || undefined}
          data-last={isLast || undefined}
          data-hint={isHint || undefined}
          data-movable={movable || undefined}
          data-drop={(isValidMove && drag?.over && positionsEqual(drag.over, pos)) || undefined}
          aria-label={label}
          aria-pressed={isDarkSquare ? isSelected : undefined}
          type={isDarkSquare ? "button" : undefined}
          tabIndex={isDarkSquare && (movable || isValidMove) ? 0 : -1}
          onPointerDown={(e: React.PointerEvent) => onPointerDown(e, row, col)}
          onClick={(e: React.MouseEvent) => {
            // pointer input is handled on pointerdown; this is the keyboard path
            if (e.detail === 0) handleSquareClick(row, col);
          }}
        >
          {ghost && (
            <React.Fragment key={`ghost-${fx!.id}`}>
              <Piece color={ghost.piece.color} isKing={ghost.piece.isKing} captured />
              <span className="burst">
                <span className="burst-ring" />
                <i /><i /><i /><i /><i /><i />
              </span>
            </React.Fragment>
          )}
          {piece && (
            <Piece
              key={landed ? `p-${fx!.id}` : "p"}
              color={piece.color}
              isKing={piece.isKing}
              lifted={isSelected && !isDragging}
              dragging={isDragging}
              crowned={Boolean(landed && fx!.crowned)}
              slide={
                landed && !fx!.dropped
                  ? {
                      dx: (fx!.move.from.col - fx!.move.to.col) * dir,
                      dy: (fx!.move.from.row - fx!.move.to.row) * dir,
                      hop: fx!.captured.length > 0,
                    }
                  : null
              }
            />
          )}
        </Tag>
      );
    }
  }

  const displaySquares = shouldFlipBoard ? squares.reverse() : squares;
  const dragPiece = drag?.active ? board[drag.from.row][drag.from.col] : null;

  return (
    <div className="board-frame">
      <div
        ref={gridRef}
        role="group"
        aria-label={t.mainMenu.appName}
        className="board-grid"
        style={{
          gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${boardSize}, minmax(0, 1fr))`,
        }}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={() => setDrag(null)}
      >
        {displaySquares}
      </div>
      {dragPiece && drag && createPortal(
        <span
          className="piece-drag"
          style={{ left: drag.x, top: drag.y, width: drag.size * 0.82, height: drag.size * 0.82 }}
        >
          <Piece color={dragPiece.color} isKing={dragPiece.isKing} lifted />
        </span>,
        document.body
      )}
    </div>
  );
};

export default Board;

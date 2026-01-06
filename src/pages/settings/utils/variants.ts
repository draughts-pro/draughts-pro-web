export type Variant = {
  name: string;
  boardSize: 8 | 10 | 12;
  piecesPerPlayer: number;
  startingRows: number;

  // Movement rules
  menMoveDirection: "forward" | "both";
  menCaptureDirection: "forward" | "both";
  kingMoveDistance: "unlimited" | 1;
  kingCaptureDistance: "unlimited" | 1;

  // Capture rules
  forcedCapture: boolean;
  mustCaptureMaximum: boolean;
  captureCountsKingsMore: boolean;
  canCaptureMultiple: boolean;
  capturedPiecesRemovedWhen: "immediately" | "afterSequence";
  canPassOverSameSquareTwice: boolean;

  // Promotion rules
  promotionRow: "lastRow";
  promotionInterruptsCapture: boolean;
  promotesToKingMidCapture: boolean;

  // Win/draw conditions
  winConditions: WinCondition[];
  drawConditions: DrawCondition[];

  // Board setup
  darkSquaresUsed: boolean;
  bottomLeftSquareColor: "light" | "dark";
};

type WinCondition = "captureAll" | "blockAll";

type DrawCondition =
  | "noLegalMoves"
  | "agreement"
  | "repetition"
  | "insufficientMaterial"
  | "25MoveRule"
  | "40MoveRule"
  | "50MoveRule";

export const variants = {
  international: {
    name: "International Checkers (Polish Draughts)",
    boardSize: 10,
    piecesPerPlayer: 20,
    startingRows: 4,
    menMoveDirection: "forward",
    menCaptureDirection: "both",
    kingMoveDistance: "unlimited",
    kingCaptureDistance: "unlimited",
    forcedCapture: true,
    mustCaptureMaximum: true,
    captureCountsKingsMore: false,
    canCaptureMultiple: true,
    capturedPiecesRemovedWhen: "afterSequence",
    canPassOverSameSquareTwice: true,
    promotionRow: "lastRow",
    promotionInterruptsCapture: false,
    promotesToKingMidCapture: false,
    winConditions: ["captureAll", "blockAll"],
    drawConditions: ["noLegalMoves", "agreement", "repetition", "25MoveRule"],
    darkSquaresUsed: true,
    bottomLeftSquareColor: "light",
  },
  nigerian: {
    name: "Nigerian Checkers (Drafts)",
    boardSize: 10,
    piecesPerPlayer: 20,
    startingRows: 4,
    menMoveDirection: "forward",
    menCaptureDirection: "both",
    kingMoveDistance: "unlimited",
    kingCaptureDistance: "unlimited",
    forcedCapture: true,
    mustCaptureMaximum: false,
    captureCountsKingsMore: false,
    canCaptureMultiple: true,
    capturedPiecesRemovedWhen: "afterSequence",
    canPassOverSameSquareTwice: true,
    promotionRow: "lastRow",
    promotionInterruptsCapture: false,
    promotesToKingMidCapture: false,
    winConditions: ["captureAll", "blockAll"],
    drawConditions: ["noLegalMoves", "agreement", "insufficientMaterial"],
    darkSquaresUsed: true,
    bottomLeftSquareColor: "light",
  },
  american: {
    name: "American Checkers (English Draughts)",
    boardSize: 8,
    piecesPerPlayer: 12,
    startingRows: 3,
    menMoveDirection: "forward",
    menCaptureDirection: "both",
    kingMoveDistance: 1,
    kingCaptureDistance: 1,
    forcedCapture: true,
    mustCaptureMaximum: false,
    captureCountsKingsMore: false,
    canCaptureMultiple: true,
    capturedPiecesRemovedWhen: "immediately",
    canPassOverSameSquareTwice: false,
    promotionRow: "lastRow",
    promotionInterruptsCapture: true,
    promotesToKingMidCapture: true,
    winConditions: ["captureAll", "blockAll"],
    drawConditions: ["noLegalMoves", "agreement", "repetition", "40MoveRule"],
    darkSquaresUsed: true,
    bottomLeftSquareColor: "dark",
  },
} as const satisfies Record<string, Variant>;

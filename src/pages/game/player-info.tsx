import PNGPiece from "@/components/PNGPiece";
import { translationsAtom } from "@/i18n";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import React from "react";

const PlayerInfo: React.FC<{
  name: string;
  isTurn: boolean;
  capturedCount: number;
  pieceColor: "light" | "dark";
  isComputer?: boolean;
  isThinking?: boolean;
}> = ({
  name,
  isTurn,
  capturedCount,
  pieceColor,
  isComputer = false,
  isThinking = false,
}) => {
  const t = useAtomValue(translationsAtom);

  return (
    <div
      className={clsx(
        "rounded-lg bg-white/20",
        isTurn && "ring-2 ring-accent-blue"
      )}
    >
      <div className="w-full p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-white">{name}</h3>
                {isComputer && (
                  <Icon icon="mdi:robot" className="text-white text-xl" />
                )}
                {isThinking && (
                  <Icon
                    icon="mdi:brain"
                    className="text-accent-blue text-xl animate-pulse"
                  />
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300 mt-1">
                <div className="w-5 h-5">
                  <PNGPiece color={pieceColor} isKing={false} />
                </div>
                <span className="font-semibold">
                  {t.game.captured}: {capturedCount}
                </span>
              </div>
            </div>
          </div>
          {isTurn && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse"></div>
              <span className="text-sm text-amber-300 font-semibold">
                {t.game.currentTurn}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;

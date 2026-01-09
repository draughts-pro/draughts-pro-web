import { useSetAtom } from "jotai";
import React, { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Game from "../game";
import { applyOpponentMoveActionAtom, newGameActionAtom } from "../game/utils/actions";
import type { GameRoom } from "../game/utils/multiplayer";
import { multiplayerService } from "../game/utils/multiplayer";
import { multiplayerGameStateAtom } from "../game/utils/multiplayer-state";
import { soundManager } from "../game/utils/sounds";
import { gameEndReasonAtom, gameStatusAtom, winnerAtom } from "../game/utils/state";

interface LocationState {
  room: GameRoom;
  playerId: string;
}

const MultiplayerGame: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const setMultiplayerState = useSetAtom(multiplayerGameStateAtom);
  const applyOpponentMove = useSetAtom(applyOpponentMoveActionAtom);
  const newGame = useSetAtom(newGameActionAtom);
  const setGameStatus = useSetAtom(gameStatusAtom);
  const setWinner = useSetAtom(winnerAtom);
  const setGameEndReason = useSetAtom(gameEndReasonAtom);

  useEffect(() => {
    const state = location.state as LocationState;

    if (!state || !state.room || !state.playerId) {
      navigate("/multiplayer");
      return;
    }

    const { room, playerId } = state;
    const player = room.players.find((p) => p.id === playerId);

    if (!player) {
      navigate("/multiplayer");
      return;
    }

    const validateAndSetup = async () => {
      try {
        const playerName = player.name || "Player";
        const result = await multiplayerService.joinRoom(room.id, playerId, playerName);
        
        if (!result.success) {
          console.log("Failed to rejoin room:", result.error);
          navigate("/");
          return;
        }
        
        const validatedRoom = result.room!;
        const validatedOpponent = validatedRoom.players.find((p: any) => p.id !== playerId);

        setMultiplayerState({
          isMultiplayer: true,
          room: validatedRoom,
          playerId,
          playerColor: player.color,
          opponentName: validatedOpponent?.name || "Opponent",
        });

        newGame();
        
      } catch (error) {
        console.error("Error validating game session:", error);
        navigate("/");
      }
    };

    validateAndSetup();

    multiplayerService.onMoveMade((data) => {
      console.log("Move received:", data);
      
      if (data.playerId === playerId) return;

      // Handle both 'from' and 'from_pos' due to Python Pydantic serialization
      const from = data.move.from || data.move.from_pos;
      applyOpponentMove({
        from: from,
        to: data.move.to,
        board: data.board,
        currentTurn: data.currentTurn,
        captures: data.move.captures || [],
      });
    });

    multiplayerService.onGameEnded((data) => {
      console.log("Game ended:", data);
      
      setGameStatus(data.winner === player.color ? "won" : "lost");
      setWinner(data.winner);
      setGameEndReason(data.reason as any);
      
      if (data.winner === player.color) {
        soundManager.playWin();
      } else {
        soundManager.playLose();
      }
    });

    multiplayerService.onPlayerLeft((data) => {
      console.log("Player left:", data);
    });

    return () => {
      multiplayerService.offMoveMade();
      multiplayerService.offGameEnded();
      multiplayerService.offPlayerLeft();

      if (roomId && playerId) {
          multiplayerService.leaveRoom(roomId, playerId).catch(console.error);
      }

      setMultiplayerState({
        isMultiplayer: false,
        room: null,
        playerId: null,
        playerColor: null,
        opponentName: null,
      });
    };
  }, [roomId, location.state, navigate, setMultiplayerState]);

  return <Game />;
};

export default MultiplayerGame;

import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { GameRoom } from "../game/utils/multiplayer";
import { multiplayerService } from "../game/utils/multiplayer";
import { preferencesAtom } from "../settings/utils/preferences";

export default function useLobby() {
    const navigate = useNavigate();
  const preferences = useAtomValue(preferencesAtom);

  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [playerId] = useState(() => {
    const savedId = localStorage.getItem("checkers_playerId");
    if (savedId) return savedId;
    const newId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("checkers_playerId", newId);
    return newId;
  });

  useEffect(() => {
    const connectToServer = async () => {
      try {
        await multiplayerService.connect();
      } catch (err) {
        setError("Failed to connect to server. Please try again.");
      }
    };

    connectToServer();

    return () => {
      if (room) {
        multiplayerService.leaveRoom(room.id, playerId);
      }
    };
  }, []);

  useEffect(() => {
    multiplayerService.onPlayerJoined((data) => {
      setRoom(data.room);
    });
    multiplayerService.onPlayerReconnected((data) => {
      setRoom(data.room);
    });
    multiplayerService.onPlayerReadyUpdate((data) => {
      setRoom(data.room);
    });
    multiplayerService.onGameStart((data) => {
      navigate(`/multiplayer-game/${data.room.id}`, {
        state: { room: data.room, playerId },
      });
    });
    multiplayerService.onPlayerLeft((data) => {
      setRoom(data.room);
    });

    return () => {
      multiplayerService.offPlayerJoined();
      multiplayerService.offPlayerReconnected();
      multiplayerService.offPlayerReadyUpdate();
      multiplayerService.offGameStart();
      multiplayerService.offPlayerLeft();
    };
  }, [navigate, playerId]);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await multiplayerService.createRoom(
        playerId,
        playerName,
        preferences.variant
      );

      if (result.success && result.room) {
        setRoom(result.room);
        setMode("create");
      } else {
        setError(result.error || "Failed to create room");
      }
    } catch (err) {
      setError("Failed to create room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!roomCode.trim() || roomCode.length !== 6) {
      setError("Please enter a valid 6-character room code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await multiplayerService.joinRoom(
        roomCode.toUpperCase(),
        playerId,
        playerName
      );

      if (result.success && result.room) {
        setRoom(result.room);
        setMode("join");
      } else {
        setError(result.error || "Failed to join room");
      }
    } catch (err) {
      setError("Failed to join room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReady = async () => {
    if (!room) return;

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return;

    setLoading(true);
    try {
      await multiplayerService.setPlayerReady(
        room.id,
        playerId,
        !player.isReady
      );
    } catch (err) {
      setError("Failed to update ready status");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!room) return;

    try {
      await multiplayerService.leaveRoom(room.id, playerId);
      setRoom(null);
      setMode("menu");
      setRoomCode("");
    } catch (err) {
      console.error("Error leaving room:", err);
    }
  };

  const handleBack = () => {
    if (room) {
      handleLeaveRoom();
    } else {
      navigate("/");
    }
    };
    
    return {
        mode,
        loading,
        error,
        playerName,
        setPlayerName,
        roomCode,
        setRoomCode,
        room,
        playerId,
        handleCreateRoom,
        handleJoinRoom,
        handleToggleReady,
        handleLeaveRoom,
        handleBack
    }
}

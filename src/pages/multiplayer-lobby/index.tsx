import GlassCard from "@/components/GlassCard";
import { translationsAtom } from "@/i18n";
import { Icon } from "@iconify/react";
import { useAtomValue } from "jotai";
import React, { useState } from "react";
import useLobby from "./use-lobby";

const MultiplayerLobby: React.FC = () => {
  const t = useAtomValue(translationsAtom);
  const h = useLobby();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (h.room) {
      navigator.clipboard.writeText(`${window.location.origin}/join/${h.room.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentPlayer = h.room?.players.find((p) => p.id === h.playerId);
  const otherPlayer = h.room?.players.find((p) => p.id !== h.playerId);
  const canStart =
    (h.room?.players.length === 2 && h.room.players.every((p) => p.isReady)) || 
    (h.room?.status === "playing"); // Allow "start" if game is already playing

  return (
    <div className="flex items-center justify-center min-h-dvh w-full p-4">
      <div className="w-full max-w-md max-h-[90dvh]">
        <GlassCard> 
          <div className="w-full p-8 space-y-6 max-h-[85dvh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <button
                onClick={h.handleBack}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <Icon icon="mdi:arrow-left" className="text-2xl text-white" />
              </button>
              <h2 className="text-2xl font-bold text-white">{t.lobby.title}</h2>
              <div className="w-10" />
            </div>

            {h.error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-200 text-sm">{h.error}</p>
              </div>
            )}

            {!h.room && (h.mode === "menu" || h.mode === "join") && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    {t.lobby.yourName}
                  </label>
                  <input
                    type="text"
                    value={h.playerName}
                    onChange={(e) => h.setPlayerName(e.target.value)}
                    placeholder={t.lobby.enterName}
                    maxLength={50}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-blue"
                  />
                </div>

                <div className="flex flex-col space-y-3">
                  {h.mode === "menu" && (
                    <>
                      <button
                        onClick={h.handleCreateRoom}
                        disabled={h.loading}
                        className="flex items-center justify-center px-3 py-2 bg-primary/80 hover:bg-primary text-white font-semibold rounded-xl transition"
                      >
                        <Icon icon="mdi:plus-circle" className="text-xl mr-2" />
                        {t.lobby.createRoom}
                      </button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/20"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-primary text-gray-400">{t.lobby.or}</span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    {h.mode === "join" && (
                      <p className="text-xs text-gray-400 text-center uppercase tracking-wider">
                        {t.lobby.roomCode}
                      </p>
                    )}
                    <input
                      type="text"
                      value={h.roomCode}
                      onChange={(e) => h.setRoomCode(e.target.value.toUpperCase())}
                      placeholder={t.lobby.enterCode}
                      maxLength={6}
                      disabled={h.mode === "join"}
                      className={`w-full px-4 py-3 bg-white/10 border ${
                        h.mode === "join" ? "border-accent-blue/50" : "border-white/20"
                      } rounded-lg text-white text-center text-lg font-mono placeholder-gray-400 focus:outline-none focus:border-accent-blue uppercase transition-colors`}
                    />
                  </div>

                  <button
                    onClick={h.handleJoinRoom}
                    disabled={h.loading}
                    className="flex items-center justify-center px-3 py-2 bg-primary/80 hover:bg-primary text-white font-semibold rounded-xl transition"
                  >
                    <Icon icon="mdi:login" className="text-xl mr-2" />
                    {t.lobby.joinRoom}
                  </button>
                </div>
              </div>
            )}

            {h.room && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">{t.lobby.shareLink}</p>
                  <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                    <p className="flex-1 text-sm font-mono text-white/80 overflow-hidden text-ellipsis whitespace-nowrap px-2">
                      {h.room ? `${window.location.origin}/join/${h.room.id}` : ""}
                    </p>
                    <button
                      onClick={handleCopyLink}
                      className={`p-2 ${
                        copied ? "bg-green-500/20 text-green-400" : "bg-accent-blue/20 text-accent-blue"
                      } hover:opacity-80 rounded-lg transition-all flex items-center space-x-1 min-w-[100px] justify-center`}
                      title={t.lobby.copyLink}
                    >
                      <Icon
                        icon={copied ? "mdi:check-circle" : "mdi:content-copy"}
                        className="text-xl"
                      />
                      <span className="text-xs font-semibold px-1">
                        {copied ? t.lobby.linkCopied : t.lobby.copyLink}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-400">
                    {t.lobby.players} ({h.room.players.length}/2)
                  </p>

                  {currentPlayer && (
                    <div className="p-4 bg-white/10 rounded-lg border-2 border-accent-blue">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon
                            icon="mdi:account"
                            className="text-2xl text-white"
                          />
                          <div>
                            <p className="text-white font-semibold">
                              {currentPlayer.name} {t.lobby.you}
                            </p>
                            <p className="text-xs text-gray-400">
                              {t.lobby.playingAs}{" "}
                              {currentPlayer.color === "light" ? t.lobby.light : t.lobby.dark}
                            </p>
                          </div>
                        </div>
                        {currentPlayer.isReady && (
                          <Icon
                            icon="mdi:check-circle"
                            className="text-2xl text-green-400"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {otherPlayer ? (
                    <div className="p-4 bg-white/10 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon
                            icon="mdi:account"
                            className="text-2xl text-white"
                          />
                          <div>
                            <p className="text-white font-semibold">
                              {otherPlayer.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {t.lobby.playingAs}{" "}
                              {otherPlayer.color === "light" ? t.lobby.light : t.lobby.dark}
                            </p>
                          </div>
                        </div>
                        {otherPlayer.isReady && (
                          <Icon
                            icon="mdi:check-circle"
                            className="text-2xl text-green-400"
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-white/5 rounded-lg border-2 border-dashed border-white/20">
                      <div className="flex items-center space-x-3">
                        <Icon
                          icon="mdi:timer-sand"
                          className="text-2xl text-gray-400 animate-pulse"
                        />
                        <p className="text-gray-400">{t.lobby.waitingForOpponent}</p>
                      </div>
                    </div>
                  )}

                  {otherPlayer && !otherPlayer.isConnected && (
                    <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg flex items-center space-x-2">
                      <Icon icon="mdi:wifi-off" className="text-yellow-400" />
                      <p className="text-yellow-200 text-sm">
                        {t.lobby.opponentDisconnected}
                      </p>
                    </div>
                  )}
                </div>

                {h.room.players.length === 2 && (
                  <div className="space-y-3">
                    {canStart && (
                      <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-center">
                        <p className="text-green-200 text-sm font-semibold">
                          {t.lobby.gameStartingSoon}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={h.handleToggleReady}
                      disabled={h.loading}
                      className={`w-full py-3 px-6 rounded-xl font-semibold transition ${
                        currentPlayer?.isReady
                          ? "bg-red-600/80 hover:bg-red-600"
                          : "bg-accent-green hover:bg-accent-green/80"
                      } text-white`}
                    >
                      {currentPlayer?.isReady ? t.lobby.cancelReady : t.lobby.readyToPlay}
                    </button>
                  </div>
                )}

                <button
                  onClick={h.handleLeaveRoom}
                  className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm"
                >
                  {t.lobby.leaveRoom}
                </button>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default MultiplayerLobby;

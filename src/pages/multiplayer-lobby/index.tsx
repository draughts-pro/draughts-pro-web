import { MiniPiece } from "@/components/Piece";
import GameButton from "@/components/ui/GameButton";
import { Icon, PlayerFace } from "@/components/ui/icons";
import { translationsAtom } from "@/i18n";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import React, { useState } from "react";
import useLobby from "./use-lobby";

/** Clipboard with a fallback for webviews that lack the async Clipboard API. */
const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
};

type Seat = { name: string; color: "light" | "dark"; isReady: boolean; isConnected?: boolean };

const SeatCard: React.FC<{ seat?: Seat; isYou?: boolean; waitingText: string }> = ({ seat, isYou, waitingText }) => {
  const t = useAtomValue(translationsAtom);

  if (!seat) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border-[3px] border-dashed border-card-edge bg-card-sunk/60 p-3">
        <div className="seat-wait grid h-[52px] w-[52px] place-items-center rounded-2xl bg-card-edge/40 text-card-text-muted">
          <PlayerFace className="w-9 h-9" />
        </div>
        <p className="seat-wait font-black text-card-text-muted">{waitingText}</p>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex items-center gap-3 rounded-2xl bg-card-sunk p-3",
        isYou ? "ring-[3px] ring-[var(--blue)]" : "ring-2 ring-card-edge"
      )}
    >
      <div className={clsx("avatar", !isYou && "avatar--rival")}>
        <PlayerFace className="w-9 h-9" />
        <MiniPiece color={seat.color} size={24} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-black leading-tight">
          {seat.name} {isYou && <span className="text-card-text-muted">{t.lobby.you}</span>}
        </p>
        <p className="text-sm font-bold text-card-text-muted">
          {t.lobby.playingAs} {seat.color === "light" ? t.lobby.light : t.lobby.dark}
        </p>
      </div>
      {seat.isReady && (
        <span
          className="pop-in grid h-9 w-9 place-items-center rounded-full text-white"
          style={{ background: "linear-gradient(180deg, var(--green-hi), var(--green))", boxShadow: "0 3px 0 var(--green-lip)" }}
          aria-label={t.lobby.readyToPlay}
        >
          <Icon name="check" className="w-5 h-5" />
        </span>
      )}
    </div>
  );
};

const MultiplayerLobby: React.FC = () => {
  const t = useAtomValue(translationsAtom);
  const h = useLobby();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (h.room) {
      copyText(`${window.location.origin}/join/${h.room.id}`).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const currentPlayer = h.room?.players.find((p) => p.id === h.playerId);
  const otherPlayer = h.room?.players.find((p) => p.id !== h.playerId);
  const canStart =
    (h.room?.players.length === 2 && h.room.players.every((p) => p.isReady)) ||
    (h.room?.status === "playing"); // Allow "start" if game is already playing

  return (
    <div className="screen screen-scroll">
      <div className="mx-auto w-full max-w-md flex flex-col gap-6 pb-4">
        <header className="flex items-center gap-3">
          <GameButton tone="slate" size="icon" onClick={h.handleBack} aria-label={t.game.backToMenu}>
            <Icon name="back" className="w-6 h-6 relative" />
          </GameButton>
          <h1 className="flex-1 text-center text-3xl sm:text-4xl font-black text-stroke">{t.lobby.title}</h1>
          <span className="w-12" aria-hidden />
        </header>

        <div className="card pop-in p-5 sm:p-6 flex flex-col gap-5">
          {h.error && (
            <div
              role="alert"
              className="rounded-2xl p-3 font-bold text-white"
              style={{ background: "linear-gradient(180deg, var(--red-hi), var(--red))", boxShadow: "0 3px 0 var(--red-lip)" }}
            >
              {h.error}
            </div>
          )}

          {!h.room && (h.mode === "menu" || h.mode === "join") && (
            <>
              <label className="block">
                <span className="mb-2 block text-sm font-black uppercase tracking-[0.1em] text-card-text-muted">
                  {t.lobby.yourName}
                </span>
                <input
                  type="text"
                  value={h.playerName}
                  onChange={(e) => h.setPlayerName(e.target.value)}
                  placeholder={t.lobby.enterName}
                  maxLength={50}
                  autoComplete="nickname"
                  className="field"
                />
              </label>

              {h.mode === "menu" && (
                <>
                  <GameButton tone="green" size="lg" className="w-full" onClick={h.handleCreateRoom} disabled={h.loading}>
                    <Icon name="plus" className="w-6 h-6 relative" />
                    <span className="relative">{t.lobby.createRoom}</span>
                  </GameButton>

                  <div className="flex items-center gap-3 text-card-text-muted" aria-hidden>
                    <span className="h-[3px] flex-1 rounded-full bg-card-edge/60" />
                    <span className="text-sm font-black uppercase">{t.lobby.or}</span>
                    <span className="h-[3px] flex-1 rounded-full bg-card-edge/60" />
                  </div>
                </>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-black uppercase tracking-[0.1em] text-card-text-muted">
                  {t.lobby.roomCode}
                </span>
                <input
                  type="text"
                  value={h.roomCode}
                  onChange={(e) => h.setRoomCode(e.target.value.toUpperCase())}
                  placeholder={t.lobby.enterCode}
                  maxLength={6}
                  disabled={h.mode === "join"}
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                  className="field text-center text-2xl tracking-[0.3em] uppercase placeholder:text-base placeholder:tracking-normal disabled:opacity-80"
                />
              </label>

              <GameButton tone="blue" size="lg" className="w-full" onClick={h.handleJoinRoom} disabled={h.loading}>
                <Icon name="login" className="w-6 h-6 relative" />
                <span className="relative">{t.lobby.joinRoom}</span>
              </GameButton>
            </>
          )}

          {h.room && (
            <>
              <div className="text-center">
                <p className="text-sm font-black uppercase tracking-[0.1em] text-card-text-muted">{t.lobby.roomCode}</p>
                <p className="num mt-1 text-5xl font-black tracking-[0.18em] text-card-text select-all break-all">{h.room.id}</p>
                <p className="mt-3 text-sm font-bold text-card-text-muted">{t.lobby.shareLink}</p>
                <div className="mt-2 flex items-center gap-2 rounded-2xl bg-card-sunk p-2 ring-2 ring-card-edge">
                  <p className="flex-1 truncate px-2 text-left text-sm font-bold text-card-text-muted">
                    {`${window.location.origin}/join/${h.room.id}`}
                  </p>
                  <GameButton tone={copied ? "green" : "blue"} size="sm" onClick={handleCopyLink} aria-live="polite">
                    <Icon name={copied ? "check" : "copy"} className="w-5 h-5 relative" />
                    <span className="relative">{copied ? t.lobby.linkCopied : t.lobby.copyLink}</span>
                  </GameButton>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-sm font-black uppercase tracking-[0.1em] text-card-text-muted">
                  {t.lobby.players} <span className="num">({h.room.players.length}/2)</span>
                </p>
                {currentPlayer && <SeatCard seat={currentPlayer} isYou waitingText={t.lobby.waitingForOpponent} />}
                <SeatCard seat={otherPlayer} waitingText={t.lobby.waitingForOpponent} />

                {otherPlayer && !otherPlayer.isConnected && (
                  <div className="flex items-center gap-2 rounded-2xl bg-[var(--gold)] p-3 font-bold text-[var(--gold-text)]">
                    <Icon name="wifiOff" className="w-5 h-5 shrink-0" />
                    <p className="text-sm">{t.lobby.opponentDisconnected}</p>
                  </div>
                )}
              </div>

              {h.room.players.length === 2 && (
                <div className="flex flex-col gap-3">
                  {canStart && (
                    <p className="pop-in text-center font-black text-[var(--green-lip)]" role="status">
                      {t.lobby.gameStartingSoon}
                    </p>
                  )}
                  <GameButton
                    tone={currentPlayer?.isReady ? "red" : "green"}
                    size="lg"
                    className="w-full"
                    onClick={h.handleToggleReady}
                    disabled={h.loading}
                  >
                    <Icon name={currentPlayer?.isReady ? "close" : "check"} className="w-6 h-6 relative" />
                    <span className="relative">{currentPlayer?.isReady ? t.lobby.cancelReady : t.lobby.readyToPlay}</span>
                  </GameButton>
                </div>
              )}

              <GameButton tone="slate" size="sm" className="w-full" onClick={h.handleLeaveRoom}>
                <span className="relative">{t.lobby.leaveRoom}</span>
              </GameButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiplayerLobby;

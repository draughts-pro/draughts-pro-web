import React from "react";

/**
 * Local, chunky game icons (no network fetch), drawn on a 24px grid with
 * rounded 2.5px strokes so they sit well next to the heavy rounded type.
 */
export type IconName =
  | "back"
  | "play"
  | "users"
  | "gear"
  | "flag"
  | "bulb"
  | "sound"
  | "mute"
  | "copy"
  | "check"
  | "refresh"
  | "home"
  | "plus"
  | "login"
  | "wifiOff"
  | "chat"
  | "clock"
  | "close";

const paths: Record<IconName, React.ReactNode> = {
  back: <path d="M15 5l-7 7 7 7" />,
  play: <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />,
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M2.5 19.5c.8-3.4 3.4-5 6.5-5s5.7 1.6 6.5 5" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M16.5 14.3c2.6.1 4.3 1.6 5 4.2" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3L5.5 5.5" />
    </>
  ),
  flag: (
    <>
      <path d="M5.5 21V4" />
      <path d="M5.5 4.5h11.5l-2.5 4 2.5 4H5.5" fill="currentColor" fillOpacity=".25" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 17.5h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" fill="currentColor" fillOpacity=".25" />
    </>
  ),
  sound: (
    <>
      <path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z" fill="currentColor" fillOpacity=".25" />
      <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
    </>
  ),
  mute: (
    <>
      <path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z" fill="currentColor" fillOpacity=".25" />
      <path d="M16 9.5l5 5M21 9.5l-5 5" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
      <path d="M15.5 5.5v-.5a2 2 0 0 0-2-2H6a2.5 2.5 0 0 0-2.5 2.5v7.5a2 2 0 0 0 2 2h.5" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  refresh: (
    <>
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
      <path d="M19.5 4.5v4h-4" />
    </>
  ),
  home: (
    <>
      <path d="M4 11l8-6.5 8 6.5" />
      <path d="M6.5 9.5V20h11V9.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  login: (
    <>
      <path d="M10 7l5 5-5 5M15 12H3.5" />
      <path d="M13.5 4H18a2.5 2.5 0 0 1 2.5 2.5v11A2.5 2.5 0 0 1 18 20h-4.5" />
    </>
  ),
  wifiOff: (
    <>
      <path d="M3 3l18 18" />
      <path d="M8.5 13.5a5 5 0 0 1 6.2-.8M5 10a10 10 0 0 1 4-2.4M14 7.3A10 10 0 0 1 19 10" />
      <circle cx="12" cy="18" r="1.2" fill="currentColor" />
    </>
  ),
  chat: <path d="M4.5 5.5h15v10h-9l-4.5 4v-4h-1.5z" />,
  clock: (
    <>
      <circle cx="12" cy="12.5" r="8" />
      <path d="M12 8.5v4.5l3 2" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
};

export const Icon: React.FC<{ name: IconName; className?: string; title?: string }> = ({
  name,
  className = "w-6 h-6",
  title,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden={title ? undefined : true}
    role={title ? "img" : undefined}
  >
    {title && <title>{title}</title>}
    {paths[name]}
  </svg>
);

/** Gold crown used on kings, the title screen and the win dialog. */
export const Crown: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 24" className={className} aria-hidden>
    <path
      d="M3 7.5l6.5 5.5L16 3l6.5 10L29 7.5 26.5 21h-21z"
      fill="currentColor"
      stroke="oklch(0.55 0.13 62)"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M6.5 17.5h19" stroke="oklch(0.55 0.13 62)" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="16" cy="12.5" r="2" fill="oklch(0.63 0.21 27)" />
  </svg>
);

/** Friendly robot face for the AI opponent avatar. */
export const RobotFace: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden>
    <path d="M16 3.5v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="16" cy="3.5" r="2" fill="oklch(0.88 0.16 90)" />
    <rect x="5" y="8" width="22" height="18" rx="7" fill="currentColor" />
    <rect x="8.5" y="12" width="15" height="9" rx="4.5" fill="oklch(0.3 0.08 320)" />
    <circle cx="12.5" cy="16.5" r="2" fill="oklch(0.9 0.17 130)" />
    <circle cx="19.5" cy="16.5" r="2" fill="oklch(0.9 0.17 130)" />
    <rect x="2" y="14" width="3" height="6" rx="1.5" fill="currentColor" />
    <rect x="27" y="14" width="3" height="6" rx="1.5" fill="currentColor" />
  </svg>
);

/** Player silhouette for human avatars. */
export const PlayerFace: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden>
    <circle cx="16" cy="12" r="6.5" fill="currentColor" />
    <path d="M4.5 29c1.2-6.3 5.6-9.5 11.5-9.5S26.3 22.7 27.5 29z" fill="currentColor" />
    <circle cx="13.6" cy="12" r="1.2" fill="oklch(0.35 0.1 250)" />
    <circle cx="18.4" cy="12" r="1.2" fill="oklch(0.35 0.1 250)" />
    <path d="M13.8 15c1.3 1 3.1 1 4.4 0" stroke="oklch(0.35 0.1 250)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
  </svg>
);

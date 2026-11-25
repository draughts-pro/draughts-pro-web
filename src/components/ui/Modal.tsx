import { cn } from "@/lib/utils";
import React, { useEffect, useId, useRef } from "react";

interface ModalProps {
  ribbon: string;
  ribbonTone?: "red" | "blue" | "green";
  children: React.ReactNode;
  onClose?: () => void;
  cardClassName?: string;
  backdrop?: React.ReactNode;
}

/**
 * Game dialog: a cream card with a ribbon title that pops in over a dimmed
 * table. Focus moves into the card and returns to the trigger on close.
 */
const Modal: React.FC<ModalProps> = ({ ribbon, ribbonTone = "red", children, onClose, cardClassName, backdrop }) => {
  const titleId = useId();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const first = cardRef.current?.querySelector<HTMLElement>("button, [href], input");
    first?.focus();
    return () => previous?.focus?.();
  }, []);

  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div className="scrim" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      {backdrop}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn("card modal-pop w-full max-w-sm px-6 pb-6 pt-12 mt-6", cardClassName)}
      >
        <h2 id={titleId} className={cn("card-ribbon", ribbonTone !== "red" && `card-ribbon--${ribbonTone}`)}>
          {ribbon}
        </h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;

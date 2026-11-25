import GameButton from "@/components/ui/GameButton";
import { Icon } from "@/components/ui/icons";
import Modal from "@/components/ui/Modal";
import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
  ribbon?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDangerous = false,
  ribbon,
}) => {
  if (!isOpen) return null;

  return (
    <Modal ribbon={ribbon ?? confirmText} ribbonTone={isDangerous ? "red" : "blue"} onClose={onCancel}>
      <div className="text-center space-y-2 mb-7">
        <p className="text-xl font-black leading-snug text-balance">{title}</p>
        <p className="font-bold text-card-text-muted">{message}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <GameButton tone="slate" size="md" onClick={onCancel}>
          <Icon name="close" className="w-5 h-5 relative" />
          <span className="relative">{cancelText}</span>
        </GameButton>
        <GameButton tone={isDangerous ? "red" : "green"} size="md" onClick={onConfirm}>
          <Icon name="check" className="w-5 h-5 relative" />
          <span className="relative">{confirmText}</span>
        </GameButton>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;

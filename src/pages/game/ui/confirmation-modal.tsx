import { Icon } from "@iconify/react";
import React from "react";
import GlassCard from "../../../components/GlassCard";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
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
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md">
        <GlassCard>
          <div className="p-8 space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Icon
                icon={isDangerous ? "mdi:alert-circle" : "mdi:help-circle"}
                className={`text-6xl ${isDangerous ? "text-amber-400" : "text-blue-400"}`}
              />
              <h2 className="text-2xl font-bold text-white text-center">
                {title}
              </h2>
              <p className="text-gray-300 text-center">{message}</p>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={onConfirm}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-6 font-semibold rounded-xl transition ${
                  isDangerous
                    ? "bg-red-600/80 hover:bg-red-600 text-white"
                    : "bg-accent-green hover:bg-accent-green/80 text-white"
                }`}
              >
                <Icon
                  icon={isDangerous ? "mdi:alert" : "mdi:check"}
                  className="text-xl"
                />
                <span>{confirmText}</span>
              </button>
              <button
                onClick={onCancel}
                className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition"
              >
                <Icon icon="mdi:close" className="text-xl" />
                <span>{cancelText}</span>
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ConfirmationModal;

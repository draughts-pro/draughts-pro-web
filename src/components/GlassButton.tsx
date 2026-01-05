import React from "react";
import GlassCard from "./GlassCard";

interface GlassButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const GlassButton: React.FC<GlassButtonProps> = ({
  onClick,
  children,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full transition duration-300 ease-in-out transform hover:-translate-y-1 ${className}`}
    >
      <GlassCard>
        <span className="py-4 px-6 text-white text-lg font-semibold">
          {children}
        </span>
      </GlassCard>
    </button>
  );
};

export default GlassButton;

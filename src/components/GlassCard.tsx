import React from "react";
import GlassSurface from "./GlassSurface";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "" }) => {
  return (
    <GlassSurface
      displace={15}
      distortionScale={-150}
      redOffset={5}
      greenOffset={15}
      blueOffset={25}
      brightness={60}
      opacity={0.8}
      mixBlendMode="screen"
      width="100%"
      height="auto"
      className={className}
    >
      {children}
    </GlassSurface>
  );
};

export default GlassCard;

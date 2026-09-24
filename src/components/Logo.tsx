/**
 * Logo de Nonnapp (icono y texto) con tamaños configurables.
 */

import React from "react";
import logoSrc from '../assets/logo-icon.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = "w-12 h-12",
  showText = true,
  textClassName = "text-2xl",
}) => {
  return (
    <div className="flex items-center gap-2 select-non">
      <img src={logoSrc} alt="Nonnapp" className={`object-contain ${className}`} />
      {showText && (
        <span className={`font-display font-semibold tracking-tight ${textClassName}`}>
          <span className="text-accent">nonn</span><span className="text-primary">app</span>
        </span>
      )}
    </div>
  );
};

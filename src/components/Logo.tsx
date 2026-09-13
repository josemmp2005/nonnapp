import React from "react";
import logoSrc from '../assets/logo.png';

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
    <div className="flex items-center gap-3 select-non">
      <img src={logoSrc} alt="Nonnapp Logo" className={className} />
      {showText && (
        <span className={`font-parisienne font-bold font tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-orange-700 pl-0.5 mt-[7px] ${textClassName}`}>
          Nonnapp
        </span>
      )}
    </div>
  );
};

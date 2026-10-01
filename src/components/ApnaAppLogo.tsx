import React from 'react';
import logoImg from '../assets/images/apnaapp32_logo_1790839984345.jpg';

interface ApnaAppLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const ApnaAppLogo: React.FC<ApnaAppLogoProps> = ({
  size = 36,
  className = '',
  showText = false,
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="relative rounded-xl overflow-hidden shrink-0 shadow-md ring-1 ring-white/15 bg-slate-900 flex items-center justify-center group"
      >
        <img
          src={logoImg}
          alt="ApnaApp32 Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-base font-extrabold tracking-tight text-white leading-none">
            ApnaApp<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 font-mono">32</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono tracking-wider mt-0.5">
            Direct OTA Installer
          </span>
        </div>
      )}
    </div>
  );
};

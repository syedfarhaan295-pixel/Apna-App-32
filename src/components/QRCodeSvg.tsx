import React, { useMemo } from 'react';
import { generateQRMatrix } from '../utils/qr';

interface QRCodeSvgProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
  showCenterIcon?: boolean;
}

export const QRCodeSvg: React.FC<QRCodeSvgProps> = ({
  value,
  size = 200,
  className = '',
  darkColor = '#0f172a',
  lightColor = '#ffffff',
  showCenterIcon = true,
}) => {
  const matrix = useMemo(() => {
    try {
      return generateQRMatrix(value);
    } catch (err) {
      console.error('Failed to generate QR code matrix', err);
      return [];
    }
  }, [value]);

  if (!matrix.length) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono"
      >
        QR unavailable
      </div>
    );
  }

  const moduleCount = matrix.length;
  const padding = 3; // Quiet zone in modules
  const totalGridSize = moduleCount + padding * 2;
  const moduleSize = size / totalGridSize;

  // Build SVG path string for high rendering performance
  let pathD = '';
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (matrix[r][c]) {
        // Skip modules under the center logo if enabled
        if (showCenterIcon) {
          const centerMin = Math.floor(moduleCount / 2) - 2;
          const centerMax = Math.floor(moduleCount / 2) + 2;
          if (r >= centerMin && r <= centerMax && c >= centerMin && c <= centerMax) {
            continue;
          }
        }
        const x = (c + padding) * moduleSize;
        const y = (r + padding) * moduleSize;
        pathD += `M${x},${y}h${moduleSize}v${moduleSize}h-${moduleSize}z `;
      }
    }
  }

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="rounded-lg shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
      >
        {/* Background */}
        <rect width={size} height={size} fill={lightColor} rx="8" />
        {/* QR Modules */}
        <path d={pathD} fill={darkColor} />

        {/* Center Emblem */}
        {showCenterIcon && (
          <g>
            <rect
              x={size / 2 - 16}
              y={size / 2 - 16}
              width={32}
              height={32}
              rx={6}
              fill="#090d16"
              stroke="#06b6d4"
              strokeWidth={1.5}
            />
            {/* Center OTA Arrow */}
            <path
              d={`M${size / 2} ${size / 2 - 8} L${size / 2} ${size / 2 + 6} M${size / 2} ${size / 2 + 6} L${size / 2 - 5} ${size / 2 + 1} M${size / 2} ${size / 2 + 6} L${size / 2 + 5} ${size / 2 + 1}`}
              stroke="#38bdf8"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={`M${size / 2 - 6} ${size / 2 + 9} L${size / 2 + 6} ${size / 2 + 9}`}
              stroke="#38bdf8"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    </div>
  );
};

'use client';

import * as React from 'react';
import { ATTRIBUTE_KEYS, ATTRIBUTE_DEFINITIONS } from '@/../src/shared/constants/attributes';
import type { CharacterAttribute, AttributeKey } from '@/../src/shared/types/attribute';

interface AttributeRadarProps {
  attributes: CharacterAttribute[];
  size?: number;
  className?: string;
}

export function AttributeRadar({
  attributes,
  size = 280,
  className = '',
}: AttributeRadarProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.72;

  // Maximum scale level for normalization (minimum 5, scales if higher)
  const maxLevel = Math.max(
    5,
    ...attributes.map((a) => a.level)
  );

  const getCoordinates = (index: number, total: number, val: number, maxVal: number) => {
    // Angle in radians (start from top: -PI / 2)
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (val / maxVal) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Map attributes in standard order
  const orderedAttributes = ATTRIBUTE_KEYS.map((key) => {
    const found = attributes.find((a) => a.attributeKey === key);
    return {
      key,
      level: found ? found.level : 1,
      def: ATTRIBUTE_DEFINITIONS[key],
    };
  });

  const totalPoints = orderedAttributes.length;

  // Web grid levels (3 concentric rings: 33%, 66%, 100%)
  const gridLevels = [0.33, 0.66, 1.0];

  // Data polygon points
  const dataPoints = orderedAttributes.map((item, i) => {
    const { x, y } = getCoordinates(i, totalPoints, item.level, maxLevel);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible select-none"
      >
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* Background Web Polygons */}
        {gridLevels.map((levelRatio, idx) => {
          const ringPoints = orderedAttributes.map((_, i) => {
            const { x, y } = getCoordinates(i, totalPoints, maxLevel * levelRatio, maxLevel);
            return `${x},${y}`;
          }).join(' ');

          return (
            <polygon
              key={`grid-${idx}`}
              points={ringPoints}
              fill="none"
              stroke="currentColor"
              strokeDasharray={idx < 2 ? '3 3' : undefined}
              className="text-muted-foreground/25"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis Spokes from Center */}
        {orderedAttributes.map((_, i) => {
          const { x, y } = getCoordinates(i, totalPoints, maxLevel, maxLevel);
          return (
            <line
              key={`spoke-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="currentColor"
              className="text-muted-foreground/20"
              strokeWidth="1"
            />
          );
        })}

        {/* Filled Data Polygon */}
        <polygon
          points={dataPoints}
          fill="url(#radarGradient)"
          stroke="#6366f1"
          strokeWidth="2.5"
          className="transition-all duration-300 drop-shadow-sm"
        />

        {/* Attribute Vertex Nodes */}
        {orderedAttributes.map((item, i) => {
          const { x, y } = getCoordinates(i, totalPoints, item.level, maxLevel);
          return (
            <g key={`vertex-${item.key}`}>
              <circle
                cx={x}
                cy={y}
                r="4.5"
                className="fill-indigo-600 stroke-background stroke-2 transition-all hover:r-6"
              />
            </g>
          );
        })}

        {/* Outer Labels */}
        {orderedAttributes.map((item, i) => {
          const { x, y, angle } = getCoordinates(i, totalPoints, maxLevel * 1.18, maxLevel);
          const textAnchor = Math.cos(angle) > 0.3 ? 'start' : Math.cos(angle) < -0.3 ? 'end' : 'middle';
          const dy = Math.sin(angle) > 0.4 ? '0.8em' : Math.sin(angle) < -0.4 ? '-0.4em' : '0.3em';

          return (
            <g key={`label-${item.key}`}>
              <text
                x={x}
                y={y}
                dy={dy}
                textAnchor={textAnchor}
                className="text-[11px] font-semibold fill-foreground tracking-tight"
              >
                {item.def.code}
                <tspan className="fill-muted-foreground text-[10px] font-mono ml-1">
                  {' '}
                  L{item.level}
                </tspan>
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

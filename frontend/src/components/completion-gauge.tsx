"use client";

interface CompletionGaugeProps {
  completed: number;
  total: number;
}

export function CompletionGauge({ completed, total }: CompletionGaugeProps) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  // SVG arc math: 180-degree gauge (bottom half is open)
  const startAngle = -210;
  const endAngle = 30;
  const range = endAngle - startAngle; // 240 degrees
  const needleAngle = startAngle + (percentage / 100) * range;

  const cx = 150;
  const cy = 140;
  const r = 100;

  function polarToCartesian(angle: number) {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  function describeArc(start: number, end: number) {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  const needleTip = polarToCartesian(needleAngle);

  // Colored segments
  const segmentColors = [
    { from: startAngle, to: startAngle + range * 0.33, color: "#ef4444" },
    { from: startAngle + range * 0.33, to: startAngle + range * 0.66, color: "#facc15" },
    { from: startAngle + range * 0.66, to: endAngle, color: "#22c55e" },
  ];

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 200" className="w-full max-w-[280px]">
        {/* Background track */}
        <path
          d={describeArc(startAngle, endAngle)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Colored segments */}
        {segmentColors.map((seg, i) => (
          <path
            key={i}
            d={describeArc(seg.from, seg.to)}
            fill="none"
            stroke={seg.color}
            strokeWidth="20"
            strokeLinecap="butt"
            opacity={0.8}
          />
        ))}

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke="#f97316"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="6" fill="#f97316" />

        {/* Percentage text */}
        <text
          x={cx}
          y={cy + 40}
          textAnchor="middle"
          className="text-3xl font-bold"
          fill="currentColor"
          fontSize="32"
        >
          {percentage}%
        </text>

        {/* Label */}
        <text
          x={cx}
          y={cy + 60}
          textAnchor="middle"
          fill="#6b7280"
          fontSize="13"
        >
          Completed
        </text>
      </svg>
      <p className="text-sm text-muted-foreground mt-1">
        {completed} of {total} tasks completed
      </p>
    </div>
  );
}

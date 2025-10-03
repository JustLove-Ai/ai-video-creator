"use client";

import { ChartData } from "@/types";

interface ChartRendererProps {
  data: ChartData;
  className?: string;
}

export function ChartRenderer({ data, className = "" }: ChartRendererProps) {
  const { type, title, labels, datasets } = data;

  if (!datasets || datasets.length === 0) return null;

  const maxValue = Math.max(...datasets[0].data);
  const chartHeight = 200;

  if (type === "bar") {
    return (
      <div className={`bg-white rounded-lg border border-border p-6 flex flex-col justify-center ${className}`}>
        <h3 className="text-lg font-semibold mb-6 text-center">{title}</h3>
        <div className="flex items-end justify-around gap-2" style={{ height: chartHeight }}>
          {datasets[0].data.map((value, index) => {
            const height = (value / maxValue) * (chartHeight - 40);
            return (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div className="text-xs font-medium text-muted-foreground">{value}</div>
                <div
                  className="w-full rounded-t transition-all hover:opacity-80"
                  style={{
                    height: `${height}px`,
                    backgroundColor: datasets[0].color,
                    minHeight: "4px",
                  }}
                />
                <div className="text-xs text-muted-foreground text-center max-w-full truncate">
                  {labels[index]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === "pie") {
    const total = datasets[0].data.reduce((sum, val) => sum + val, 0);
    let currentAngle = 0;

    return (
      <div className={`bg-white rounded-lg border border-border p-6 flex flex-col justify-center ${className}`}>
        <h3 className="text-lg font-semibold mb-6 text-center">{title}</h3>
        <div className="flex items-center justify-center gap-6">
          <svg width="160" height="160" viewBox="0 0 200 200" className="shrink-0">
            {datasets[0].data.map((value, index) => {
              const percentage = value / total;
              const angle = percentage * 360;
              const startAngle = currentAngle;
              currentAngle += angle;

              const startRad = (startAngle - 90) * (Math.PI / 180);
              const endRad = (startAngle + angle - 90) * (Math.PI / 180);

              const x1 = 100 + 90 * Math.cos(startRad);
              const y1 = 100 + 90 * Math.sin(startRad);
              const x2 = 100 + 90 * Math.cos(endRad);
              const y2 = 100 + 90 * Math.sin(endRad);

              const largeArcFlag = angle > 180 ? 1 : 0;

              const pathData = `M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

              // Generate color variations
              const hue = index * (360 / datasets[0].data.length);
              const color = `hsl(${hue}, 70%, 55%)`;

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={color}
                  className="hover:opacity-80 transition-opacity"
                />
              );
            })}
          </svg>
          <div className="flex-1 space-y-2">
            {labels.map((label, index) => {
              const hue = index * (360 / datasets[0].data.length);
              const color = `hsl(${hue}, 70%, 55%)`;
              const percentage = ((datasets[0].data[index] / total) * 100).toFixed(1);
              return (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div className="text-xs">
                    <div className="font-medium">{label}</div>
                    <div className="text-muted-foreground">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (type === "line") {
    const padding = 40;
    const chartWidth = 280;
    const points = datasets[0].data.map((value, index) => {
      const x = padding + (index / (datasets[0].data.length - 1)) * chartWidth;
      const y = chartHeight - 40 - (value / maxValue) * (chartHeight - 60);
      return `${x},${y}`;
    }).join(" ");

    return (
      <div className={`bg-white rounded-lg border border-border p-6 flex flex-col justify-center ${className}`}>
        <h3 className="text-lg font-semibold mb-6 text-center">{title}</h3>
        <svg width="360" height={chartHeight} viewBox={`0 0 360 ${chartHeight}`} className="mx-auto">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = (chartHeight - 40) * (i / 4);
            return (
              <line
                key={i}
                x1={padding}
                y1={y}
                x2={padding + chartWidth}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke={datasets[0].color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {datasets[0].data.map((value, index) => {
            const x = padding + (index / (datasets[0].data.length - 1)) * chartWidth;
            const y = chartHeight - 40 - (value / maxValue) * (chartHeight - 60);
            return (
              <g key={index}>
                <circle cx={x} cy={y} r="4" fill={datasets[0].color} className="hover:r-6 transition-all" />
                <text x={x} y={chartHeight - 15} textAnchor="middle" className="text-xs fill-muted-foreground">
                  {labels[index]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  if (type === "funnel") {
    const total = datasets[0].data.reduce((sum, val) => sum + val, 0);
    const funnelHeight = 300;
    const funnelWidth = 300;

    return (
      <div className={`bg-white rounded-lg border border-border p-6 flex flex-col justify-center ${className}`}>
        <h3 className="text-lg font-semibold mb-6 text-center">{title}</h3>
        <svg width={funnelWidth} height={funnelHeight} viewBox={`0 0 ${funnelWidth} ${funnelHeight}`} className="mx-auto">
          {datasets[0].data.map((value, index) => {
            const percentage = value / total;
            const topWidth = ((datasets[0].data[0] - value) / datasets[0].data[0]) * 100 + 50;
            const bottomWidth = index < datasets[0].data.length - 1
              ? ((datasets[0].data[0] - datasets[0].data[index + 1]) / datasets[0].data[0]) * 100 + 50
              : 30;

            const segmentHeight = funnelHeight / datasets[0].data.length;
            const y = index * segmentHeight;

            const x1 = (funnelWidth - topWidth * 2) / 2;
            const x2 = x1 + topWidth * 2;
            const x3 = (funnelWidth - bottomWidth * 2) / 2;
            const x4 = x3 + bottomWidth * 2;

            const hue = index * (360 / datasets[0].data.length);
            const color = `hsl(${hue}, 70%, 55%)`;

            return (
              <g key={index}>
                <path
                  d={`M ${x1} ${y} L ${x2} ${y} L ${x4} ${y + segmentHeight} L ${x3} ${y + segmentHeight} Z`}
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity"
                />
                <text
                  x={funnelWidth / 2}
                  y={y + segmentHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm font-medium fill-white"
                >
                  {labels[index]}: {value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  return null;
}

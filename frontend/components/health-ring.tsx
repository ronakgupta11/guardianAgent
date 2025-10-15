"use client"

import { useMemo } from "react"

export function HealthRing({ healthFactor, size = 160 }: { healthFactor: number; size?: number }) {
  const clamped = Math.max(0, Math.min(2, healthFactor))
  const percent = clamped / 2
  const stroke = 10
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const dash = circumference * percent

  const color = useMemo(() => {
    if (healthFactor >= 1.5) return "var(--color-chart-2)" // green/teal-like
    if (healthFactor >= 1.2) return "var(--chart-4)" // amber
    return "var(--destructive)" // red-ish
  }, [healthFactor])

  return (
    <svg width={size} height={size} role="img" aria-label={`Health factor ${healthFactor.toFixed(2)}`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--muted)" strokeWidth={stroke} fill="none" opacity={0.4} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="font-semibold"
        style={{ fontSize: size * 0.18 }}
      >
        {healthFactor.toFixed(2)}
      </text>
    </svg>
  )
}

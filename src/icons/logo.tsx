import React from 'react'

const EMBER = 'hsl(14 78% 57%)'

type LogoProps = {
  /** 'wordmark' renders the full logo (mark + "Domainly AI"), 'mark' renders just the pulse icon */
  variant?: 'wordmark' | 'mark'
  width?: number
  height?: number
  className?: string
  onClick?: () => void
}

/**
 * Single source of truth for the Domainly AI logo.
 * The wordmark text uses `fill-foreground` so it adapts to the active theme.
 */
export const Logo = ({
  variant = 'wordmark',
  width,
  height,
  className,
  onClick,
}: LogoProps) => {
  if (variant === 'mark') {
    return (
      <svg
        width={width ?? 32}
        height={height ?? 32}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        onClick={onClick}
        role="img"
        aria-label="Domainly AI"
      >
        <polyline
          points="2,16 8,16 12,5 16,27 20,16 28,16"
          stroke={EMBER}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="29.5" cy="16" r="1.5" fill={EMBER} opacity="0.6" />
      </svg>
    )
  }

  return (
    <svg
      width={width ?? 150}
      height={height ?? 28}
      viewBox="0 0 180 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
      role="img"
      aria-label="Domainly AI"
    >
      <polyline
        points="2,18 10,18 14,6 18,30 22,18 30,18"
        stroke={EMBER}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="32" cy="18" r="2" fill={EMBER} opacity="0.5" />
      <text
        x="42"
        y="24"
        fontFamily="Outfit, system-ui, sans-serif"
        fontSize="18"
        fontWeight="600"
        letterSpacing="-0.5"
        className="fill-foreground"
      >
        Domainly AI
      </text>
    </svg>
  )
}

export default Logo

import Image from 'next/image'
import { cn } from '@/lib/utils'

type LogoProps = {
  /** Kept for backwards compat — ignored, /logo.png already contains the full lockup. */
  variant?: 'wordmark' | 'mark'
  width?: number
  height?: number
  className?: string
  onClick?: () => void
}

/**
 * Single source of truth for the Domainly AI logo.
 * /logo.png is square, so `height` drives the size (width is ignored
 * to avoid distortion). The white backing keeps the dark wordmark
 * readable on the default dark theme while staying invisible on light.
 */
export const Logo = ({ width, height, className, onClick }: LogoProps) => {
  // Scale up: /logo.png is a large square lockup, so raw heights (22-28px)
  // render the wordmark unreadably small. One multiplier fixes every caller.
  // 2x is the max that still fits the 76px minimized sidebar + h-16 navbar.
  const side = Math.round((height ?? width ?? 32) * 2)
  return (
    <Image
      src="/logo.png"
      alt="Domainly AI"
      width={side}
      height={side}
      quality={100}
      sizes={`${side}px`}
      draggable={false}
      className={cn(
        'shrink-0 select-none object-contain dark:rounded-lg dark:bg-white dark:p-0.5 dark:ring-1 dark:ring-white/30',
        className
      )}
      onClick={onClick}
    />
  )
}

export default Logo

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
  const side = height ?? width ?? 32
  return (
    <Image
      src="/logo.png"
      alt="Domainly AI"
      width={side}
      height={side}
      className={cn(
        'shrink-0 object-contain dark:rounded-md dark:bg-white',
        className
      )}
      onClick={onClick}
    />
  )
}

export default Logo

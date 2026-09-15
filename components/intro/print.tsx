import Image from 'next/image'
import type { CSSProperties } from 'react'
import type { Photo } from '@/lib/intro/types'
import { PRINT_SIZES } from './use-preload'

type Props = {
  photo: Photo
  className?: string
  style?: CSSProperties
}

/** A photograph as a physical print: border, shadow, a slight lean. Never wider than the screen. */
export function Print({ photo, className = '', style }: Props) {
  return (
    <figure
      className={`intro-print ${className}`}
      style={
        { '--tilt': `${photo.tilt ?? 0}deg`, '--ratio': photo.width / photo.height, ...style } as CSSProperties
      }
    >
      <span className="intro-print-surface">
        <Image
          src={photo.src}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          sizes={PRINT_SIZES}
          loading="eager"
          draggable={false}
        />
      </span>
    </figure>
  )
}

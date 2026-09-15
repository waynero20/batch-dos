'use client'

import { useEffect } from 'react'
import { getImageProps } from 'next/image'
import type { Photo } from '@/lib/intro/types'

/** Same `sizes` every <Print> uses, so the warmed candidate is the one that gets rendered. */
export const PRINT_SIZES = '(max-width: 480px) 80vw, 460px'

const warmed = new Set<string>()

/**
 * Starts downloading upcoming photos before their scene mounts. `getImageProps` yields the
 * exact srcset the <Image> will ask for, so the browser picks the right size for this screen
 * instead of the original file.
 */
export function usePreload(photos: Photo[]) {
  useEffect(() => {
    for (const photo of photos) {
      if (warmed.has(photo.src)) continue
      warmed.add(photo.src)
      const { props } = getImageProps({
        src: photo.src,
        width: photo.width,
        height: photo.height,
        alt: '',
        sizes: PRINT_SIZES,
      })
      const img = new window.Image()
      img.decoding = 'async'
      if (props.sizes) img.sizes = props.sizes
      if (props.srcSet) img.srcset = props.srcSet
      img.src = props.src
    }
  }, [photos])
}

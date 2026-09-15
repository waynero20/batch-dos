'use client'

import { useEffect, useMemo, useState } from 'react'
import type { IntroConfig, Scene } from '@/lib/intro/types'
import { sceneDuration, scenePhotos } from '@/lib/intro/timing'
import { ProgressBar } from './progress-bar'
import { FinalLine } from './scenes/final-line'
import { MemoryScene } from './scenes/memory-scene'
import { NameSequence } from './scenes/name-sequence'
import { PhotoMontage } from './scenes/photo-montage'
import { PlanohanScene } from './scenes/planohan-scene'
import { QuietLines } from './scenes/quiet-lines'
import { TaraScene } from './scenes/tara-scene'
import { SkipButton } from './skip-button'
import { usePausableTimeout } from './use-pausable-timeout'
import { usePreload } from './use-preload'

type Props = {
  config: IntroConfig
  /** Scene index to begin from. Only read on mount. */
  startAt?: number
  reducedMotion: boolean
  onEnd: () => void
  onSkip: () => void
}

/**
 * The timeline. One piece of state (which scene) and one timer per scene; everything that
 * happens inside a scene is CSS driven by that scene's config.
 */
export function ReunionIntro({ config, startAt = 0, reducedMotion, onEnd, onSkip }: Props) {
  const { scenes, names } = config
  const [index, setIndex] = useState(startAt)
  const paused = usePageHidden()

  // Index never passes the last scene: the final timer calls onEnd instead of advancing.
  const scene = scenes[index]!
  const isLast = index === scenes.length - 1

  usePausableTimeout(
    sceneDuration(scene),
    () => (isLast ? onEnd() : setIndex((i) => i + 1)),
    paused,
    index,
  )

  // This scene's photos and the next scene's, so nothing pops in late.
  const upcoming = useMemo(
    () => [...scenePhotos(scenes[index]), ...scenePhotos(scenes[index + 1])],
    [scenes, index],
  )
  usePreload(upcoming)

  const previous = scenes[index - 1]

  return (
    <div className="intro-stage" data-scene={scene.type} data-paused={paused || undefined}>
      <div className="intro-scenes" aria-hidden="true">
        {renderScene(scene, index, { names, paused, reducedMotion, previous })}
      </div>

      <p className="sr-only" aria-live="polite">
        {describe(scene, names)}
      </p>

      <ProgressBar key={index} duration={sceneDuration(scene)} />
      <SkipButton onSkip={onSkip} />
    </div>
  )
}

function renderScene(
  scene: Scene,
  index: number,
  ctx: { names: readonly string[]; paused: boolean; reducedMotion: boolean; previous?: Scene },
) {
  switch (scene.type) {
    case 'memory':
      return <MemoryScene key={index} scene={scene} />
    case 'montage':
      return <PhotoMontage key={index} scene={scene} />
    case 'lines':
      return <QuietLines key={index} scene={scene} />
    case 'names':
      return (
        <NameSequence
          key={index}
          scene={scene}
          names={ctx.names}
          paused={ctx.paused}
          reducedMotion={ctx.reducedMotion}
        />
      )
    case 'final':
      return (
        <FinalLine
          key={index}
          scene={scene}
          fromConnector={ctx.previous?.type === 'names' ? ctx.previous.connector : undefined}
        />
      )
    case 'tara':
      return <TaraScene key={index} scene={scene} />
    case 'planohan':
      return <PlanohanScene key={index} scene={scene} />
  }
}

/** What a screen reader hears. The name flurry is summarised, never read out one by one. */
function describe(scene: Scene, names: readonly string[]): string {
  switch (scene.type) {
    case 'memory':
      return [scene.year, scene.text ?? scene.photo?.alt].filter(Boolean).join('. ')
    case 'montage':
      return scene.photos.map((p) => p.alt).join(', ')
    case 'lines':
      return scene.lines.join('. ')
    case 'names':
      return `${scene.phrase} ${scene.connector} ${names.slice(0, 3).join(', ')}…`
    case 'final':
      return `${scene.phrase} ${scene.connector} ${scene.ending}`
    case 'tara':
    case 'planohan':
      return scene.text
  }
}

/** Freeze the story while the tab is in the background instead of playing it to nobody. */
function usePageHidden() {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    const update = () => setHidden(document.hidden)
    update()
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])
  return hidden
}

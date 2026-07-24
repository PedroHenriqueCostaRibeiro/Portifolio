import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useHasHover } from '../hooks/useHasHover'

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4'

// Cor sólida sob o vídeo — fallback enquanto o MP4 carrega ou se ele falha
// (evita o branco acidental). Amostrada da tonalidade média do 1º frame.
const FALLBACK_COLOR = '#8d8b89'

const SENSITIVITY = 0.8

/**
 * Full-screen background video whose playhead is scrubbed forward/backward
 * by horizontal mouse movement. Seeking is queued through the `onSeeked`
 * handler so we never flood the element with overlapping seeks.
 *
 * Em touch (sem `mousemove`) o vídeo toca em loop; com `prefers-reduced-motion`
 * ele fica parado no 1º frame. Se o MP4 falhar, a cor de fallback assume.
 */
export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const hasHover = useHasHover()
  const [failed, setFailed] = useState(false)

  // Latest desired time + whether a seek is currently in flight.
  const targetTimeRef = useRef(0)
  const seekingRef = useRef(false)
  const prevXRef = useRef<number | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // Vídeo quebrado, ou usuário prefere movimento reduzido: fica no 1º frame
    // (nunca é play()ado nem scrubbed) — a cor de fallback cobre a tela.
    if (failed || prefersReducedMotion) return

    // Touch (sem hover fino): não há `mousemove` para dirigir o scrub, então
    // deixamos o vídeo vivo em loop. Autoplay pode ser bloqueado — cor fica.
    if (!hasHover) {
      video.loop = true
      video.play().catch(() => {})
      return
    }

    const seek = () => {
      if (!video.duration || Number.isNaN(video.duration)) return
      // Only issue a seek when the element is idle and the target moved.
      if (seekingRef.current) return
      if (Math.abs(video.currentTime - targetTimeRef.current) < 0.001) return

      seekingRef.current = true
      video.currentTime = targetTimeRef.current
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (prevXRef.current === null) {
        prevXRef.current = e.clientX
        return
      }

      const delta = e.clientX - prevXRef.current
      prevXRef.current = e.clientX

      if (!video.duration || Number.isNaN(video.duration)) return

      const offset = (delta / window.innerWidth) * SENSITIVITY * video.duration
      let next = targetTimeRef.current + offset
      next = Math.max(0, Math.min(video.duration, next))
      targetTimeRef.current = next

      seek()
    }

    const handleSeeked = () => {
      seekingRef.current = false
      // If the target moved while we were seeking, chase it.
      if (Math.abs(video.currentTime - targetTimeRef.current) >= 0.001) {
        seek()
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    video.addEventListener('seeked', handleSeeked)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      video.removeEventListener('seeked', handleSeeked)
    }
  }, [prefersReducedMotion, hasHover, failed])

  return (
    <video
      ref={videoRef}
      src={VIDEO_SRC}
      onError={() => setFailed(true)}
      muted
      playsInline
      preload="auto"
      className="fixed inset-0 h-full w-full z-0"
      style={{
        objectFit: 'cover',
        objectPosition: '70% center',
        backgroundColor: FALLBACK_COLOR,
      }}
    />
  )
}

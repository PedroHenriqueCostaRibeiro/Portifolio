import { useEffect, useRef } from 'react'

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4'

const SENSITIVITY = 0.8

/**
 * Full-screen background video whose playhead is scrubbed forward/backward
 * by horizontal mouse movement. Seeking is queued through the `onSeeked`
 * handler so we never flood the element with overlapping seeks.
 */
export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Latest desired time + whether a seek is currently in flight.
  const targetTimeRef = useRef(0)
  const seekingRef = useRef(false)
  const prevXRef = useRef<number | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

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
  }, [])

  return (
    <video
      ref={videoRef}
      src={VIDEO_SRC}
      muted
      playsInline
      preload="auto"
      className="fixed inset-0 h-full w-full"
      style={{
        zIndex: 0,
        objectFit: 'cover',
        objectPosition: '70% center',
      }}
    />
  )
}

import { useEffect, useRef, useCallback } from 'react';

const SENSITIVITY = 0.8;

export function useVideoScrub(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const prevX = useRef(0);
  const targetTime = useRef(0);
  const isSeeking = useRef(false);
  const pendingSeek = useRef(false);

  const performSeek = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    if (isSeeking.current) {
      pendingSeek.current = true;
      return;
    }

    isSeeking.current = true;
    video.currentTime = targetTime.current;
  }, [videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Respect prefers-reduced-motion
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) return;

    // Detect touch devices
    const isTouchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!video.duration) return;

      const currentX = e.clientX;
      const delta = currentX - prevX.current;
      prevX.current = currentX;

      const timeDelta =
        (delta / window.innerWidth) * SENSITIVITY * video.duration;

      targetTime.current = Math.max(
        0,
        Math.min(video.duration, targetTime.current + timeDelta)
      );

      performSeek();
    };

    const handleSeeked = () => {
      isSeeking.current = false;
      if (pendingSeek.current) {
        pendingSeek.current = false;
        performSeek();
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      prevX.current = e.clientX;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseenter', handleMouseEnter);
    video.addEventListener('seeked', handleSeeked);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseenter', handleMouseEnter);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [videoRef, performSeek]);
}

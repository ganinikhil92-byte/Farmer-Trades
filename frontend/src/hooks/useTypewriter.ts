import { useState, useEffect, useRef } from 'react';

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  startDelay?: number;
}

interface UseTypewriterReturn {
  displayed: string;
  done: boolean;
}

export function useTypewriter({
  text,
  speed = 38,
  startDelay = 600,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.current = mql.matches;

    if (reducedMotion.current) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    let charIndex = 0;
    let interval: ReturnType<typeof setInterval>;

    const delayTimer = setTimeout(() => {
      interval = setInterval(() => {
        charIndex += 1;
        if (charIndex >= text.length) {
          setDisplayed(text);
          setDone(true);
          clearInterval(interval);
        } else {
          setDisplayed(text.slice(0, charIndex));
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(delayTimer);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

import { useEffect, useRef, useCallback } from 'react';

type RevealEffect = 'fade-up' | 'fade-left' | 'fade-right' | 'scale-up' | 'fade-in';

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  staggerChildren?: boolean;
  staggerDelay?: number;
  once?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  effect: RevealEffect = 'fade-up',
  options: ScrollRevealOptions = {}
) {
  const {
    threshold = 0.15,
    rootMargin = '0px 0px -60px 0px',
    staggerChildren = false,
    staggerDelay = 120,
    once = true,
  } = options;

  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.classList.add('scroll-revealed');
      if (staggerChildren) {
        Array.from(el.children).forEach((child) => {
          (child as HTMLElement).classList.add('scroll-revealed');
        });
      }
      return;
    }

    el.classList.add(`scroll-reveal-${effect}`);
    if (staggerChildren) {
      Array.from(el.children).forEach((child, i) => {
        const childEl = child as HTMLElement;
        childEl.classList.add('scroll-reveal-stagger-child');
        childEl.style.transitionDelay = `${i * staggerDelay}ms`;
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('scroll-revealed');
            if (staggerChildren) {
              Array.from(el.children).forEach((child) => {
                (child as HTMLElement).classList.add('scroll-revealed');
              });
            }
            if (once) observer.unobserve(el);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [effect, threshold, rootMargin, staggerChildren, staggerDelay, once]);

  return ref;
}

export function useParallax<T extends HTMLElement = HTMLDivElement>(speed = 0.3) {
  const ref = useRef<T>(null);
  const rafRef = useRef<number>(0);

  const handleScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      if (rect.bottom < 0 || rect.top > windowH) return;

      const scrolled = (windowH - rect.top) / (windowH + rect.height);
      const offset = (scrolled - 0.5) * speed * 100;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  }, [speed]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  return ref;
}

export function useHorizontalScroll<T extends HTMLElement = HTMLDivElement>(scrollRange = 300) {
  const containerRef = useRef<T>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    const content = scrollContentRef.current;
    if (!container || !content) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const windowH = window.innerHeight;
        if (rect.bottom < 0 || rect.top > windowH) return;

        const progress = Math.max(0, Math.min(1, (windowH - rect.top) / (windowH + rect.height)));
        const translateX = -(progress - 0.3) * scrollRange;
        content.style.transform = `translate3d(${translateX}px, 0, 0)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [scrollRange]);

  return { containerRef, scrollContentRef };
}

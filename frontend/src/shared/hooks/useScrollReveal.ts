import { useEffect, RefObject } from 'react';

function getIsReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

function setupReveal<T extends HTMLElement>(
  node: T,
  className: string,
  threshold: number,
  rootMargin: string
): () => void {
  const reveal = () => node.classList.add(className, 'is-visible');

  // Reduced motion / no IntersectionObserver support: reveal immediately,
  // never leave the element stuck in its blurred/hidden initial state.
  if (getIsReducedMotion() || typeof IntersectionObserver === 'undefined') {
    reveal();
    return () => { };
  }

  // Already in (or near) the viewport on mount — reveal right away.
  if (node.getBoundingClientRect().top < window.innerHeight * 0.88) {
    reveal();
    return () => { };
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      reveal();
      observer.unobserve(node);
    }
  }, { threshold, rootMargin });

  observer.observe(node);

  // Safety net: if the observer never fires (hidden container, layout race,
  // background tab, etc.) force-reveal after 2s so nothing stays blurred forever.
  const failsafe = window.setTimeout(reveal, 2000);

  return () => {
    observer.disconnect();
    window.clearTimeout(failsafe);
  };
}

export function useScrollReveal<T extends HTMLElement>(
  ref: RefObject<T>,
  className = 'reveal'
): void {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    return setupReveal(node, className, 0.12, '0px 0px -6% 0px');
  }, [ref, className]);
}

export function useRevealChildren<T extends HTMLElement>(
  ref: RefObject<T>,
  className = 'stagger'
): void {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    return setupReveal(node, className, 0.1, '0px 0px -8% 0px');
  }, [ref, className]);
}

export function useImageReveal<T extends HTMLElement>(
  ref: RefObject<T>
): void {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    return setupReveal(node, 'img-reveal', 0.15, '0px 0px -10% 0px');
  }, [ref]);
}
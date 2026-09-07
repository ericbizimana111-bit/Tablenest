import { useEffect, useRef, RefObject } from 'react';

const isReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useScrollReveal<T extends HTMLElement>(
  ref: RefObject<T>,
  className = 'reveal'
): void {
  useEffect(() => {
    const node = ref.current;
    if (!node || isReducedMotion) return;

    const reveal = () => node.classList.add(`${className}`, 'is-visible');
    if (node.getBoundingClientRect().top < window.innerHeight * 0.88) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        reveal();
        observer.unobserve(node);
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, className]);
}

export function useRevealChildren<T extends HTMLElement>(
  ref: RefObject<T>,
  className = 'stagger'
): void {
  useEffect(() => {
    const node = ref.current;
    if (!node || isReducedMotion) return;

    const reveal = () => node.classList.add(`${className}`, 'is-visible');
    if (node.getBoundingClientRect().top < window.innerHeight * 0.88) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        reveal();
        observer.unobserve(node);
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, className]);
}

export function useImageReveal<T extends HTMLElement>(
  ref: RefObject<T>
): void {
  useEffect(() => {
    const node = ref.current;
    if (!node || isReducedMotion) return;

    const reveal = () => node.classList.add('img-reveal', 'is-visible');
    if (node.getBoundingClientRect().top < window.innerHeight * 0.88) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        reveal();
        observer.unobserve(node);
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
}

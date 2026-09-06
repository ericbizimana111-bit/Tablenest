import { useEffect, useRef, RefObject } from 'react';

const isReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useScrollReveal<T extends HTMLElement>(
  ref: RefObject<T>,
  className = 'reveal'
): void {
  const node = ref.current;
  if (!node || isReducedMotion) return;

  const isAlreadyVisible =
    node.getBoundingClientRect().top < window.innerHeight * 0.88;

  if (isAlreadyVisible) {
    node.classList.add(`${className}`, 'is-visible');
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          node.classList.add(`${className}`, 'is-visible');
          observer.unobserve(node);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -6% 0px',
    }
  );

  observer.observe(node);

  useEffect(() => {
    return () => observer.disconnect();
  }, []);
}

export function useRevealChildren<T extends HTMLElement>(
  ref: RefObject<T>,
  className = 'stagger'
): void {
  const node = ref.current;
  if (!node || isReducedMotion) return;

  const isAlreadyVisible =
    node.getBoundingClientRect().top < window.innerHeight * 0.88;

  if (isAlreadyVisible) {
    node.classList.add(`${className}`, 'is-visible');
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          node.classList.add(`${className}`, 'is-visible');
          observer.unobserve(node);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -8% 0px',
    }
  );

  observer.observe(node);

  useEffect(() => {
    return () => observer.disconnect();
  }, []);
}

export function useImageReveal<T extends HTMLElement>(
  ref: RefObject<T>
): void {
  const node = ref.current;
  if (!node || isReducedMotion) return;

  const isAlreadyVisible =
    node.getBoundingClientRect().top < window.innerHeight * 0.88;

  if (isAlreadyVisible) {
    node.classList.add('img-reveal', 'is-visible');
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          node.classList.add('img-reveal', 'is-visible');
          observer.unobserve(node);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  observer.observe(node);

  useEffect(() => {
    return () => observer.disconnect();
  }, []);
}

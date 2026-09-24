import { motion } from 'motion/react';
import { LinkButton } from '@/ui/Button';

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <motion.svg viewBox="0 0 200 120" className="mx-auto w-56" initial={{ rotate: -8 }} animate={{ rotate: [-8, 6, -8] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} aria-hidden>
          <ellipse cx="100" cy="100" rx="86" ry="14" fill="#efe6d6" />
          <ellipse cx="100" cy="96" rx="60" ry="9" fill="#f7f2e9" stroke="#d5c7b0" />
          <text x="100" y="72" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="54" fontStyle="italic" fill="#16392b">
            404
          </text>
        </motion.svg>
        <h1 className="mt-6 text-[40px] leading-tight text-ink">This plate is empty</h1>
        <p className="mt-2 text-ink-3">The page you were looking for isn't on the menu.</p>
        <div className="mt-8 flex justify-center gap-2">
          <LinkButton to="/" variant="dark">
            Back to the start
          </LinkButton>
          <LinkButton to="/restaurants" variant="outline">
            Browse restaurants
          </LinkButton>
        </div>
      </div>
    </div>
  );
}

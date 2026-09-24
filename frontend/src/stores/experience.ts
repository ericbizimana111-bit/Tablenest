import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Persona = 'customer' | 'owner' | 'browsing';

interface ExperienceState {
  /** Chosen on first visit; tailors the guide and suggestions. */
  persona: Persona | null;
  guideOpen: boolean;
  setPersona: (p: Persona) => void;
  openGuide: () => void;
  closeGuide: () => void;
  conciergeOpen: boolean;
  setConcierge: (open: boolean) => void;
  /** A question to send as soon as the concierge opens (from a "Ask about this" button). */
  pendingQuestion: string | null;
  ask: (q: string) => void;
  consumeQuestion: () => string | null;
}

export const useExperience = create<ExperienceState>()(
  persist(
    (set, get) => ({
      persona: null,
      guideOpen: false,
      setPersona: (persona) => set({ persona }),
      openGuide: () => set({ guideOpen: true }),
      closeGuide: () => set({ guideOpen: false }),
      conciergeOpen: false,
      setConcierge: (conciergeOpen) => set({ conciergeOpen }),
      pendingQuestion: null,
      ask: (q) => set({ pendingQuestion: q, conciergeOpen: true }),
      consumeQuestion: () => {
        const q = get().pendingQuestion;
        if (q) set({ pendingQuestion: null });
        return q;
      },
    }),
    {
      name: 'tn.experience',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ persona: s.persona }),
    },
  ),
);

/** The cloche welcome plays once per browser session. */
export const welcomeSeen = {
  get: () => {
    try {
      return sessionStorage.getItem('tn.welcome') === '1';
    } catch {
      return true;
    }
  },
  set: () => {
    try {
      sessionStorage.setItem('tn.welcome', '1');
    } catch {
      /* ignore */
    }
  },
};

import { Variants, Transition } from 'framer-motion';

export const smoothTransition: Transition = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1], // easeOutExpo
};

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 30,
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const cardHover: Variants = {
  rest: { y: 0, transition: { duration: 0.2 } },
  hover: {
    y: -3,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

export const scaleTap = {
  tap: { scale: 0.98 },
};

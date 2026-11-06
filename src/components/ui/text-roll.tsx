import { motion } from 'motion/react';
import type {
  VariantLabels,
  Target,
  TargetAndTransition,
  Transition,
} from 'motion/react';
import './text-roll.css';

export type TextRollProps = {
  children: string;
  duration?: number;
  getEnterDelay?: (index: number) => number;
  getExitDelay?: (index: number) => number;
  className?: string;
  transition?: Transition;
  variants?: {
    enter: {
      initial: Target | VariantLabels | boolean;
      animate: TargetAndTransition | VariantLabels;
    };
    exit: {
      initial: Target | VariantLabels | boolean;
      animate: TargetAndTransition | VariantLabels;
    };
  };
  onAnimationComplete?: () => void;
};

export function TextRoll({
  children,
  duration = 0.5,
  getEnterDelay = (index) => index * 0.1,
  getExitDelay = (index) => index * 0.1 + 0.2,
  className,
  transition = { ease: 'easeIn' },
  variants,
  onAnimationComplete,
}: TextRollProps) {
  const defaults = {
    enter: { initial: { rotateX: 0 }, animate: { rotateX: 90 } },
    exit: { initial: { rotateX: 90 }, animate: { rotateX: 0 } },
  } as const;
  const letters = children.split('');

  return (
    <span className={className}>
      {letters.map((letter, index) => {
        const content = letter === ' ' ? '\u00a0' : letter;
        return (
          <span key={index} className="text-roll-letter" aria-hidden="true">
            <motion.span
              className="text-roll-face text-roll-enter"
              initial={variants?.enter?.initial ?? defaults.enter.initial}
              animate={variants?.enter?.animate ?? defaults.enter.animate}
              transition={{ ...transition, duration, delay: getEnterDelay(index) }}
            >
              {content}
            </motion.span>
            <motion.span
              className="text-roll-face text-roll-exit"
              initial={variants?.exit?.initial ?? defaults.exit.initial}
              animate={variants?.exit?.animate ?? defaults.exit.animate}
              transition={{ ...transition, duration, delay: getExitDelay(index) }}
              onAnimationComplete={index === letters.length - 1 ? onAnimationComplete : undefined}
            >
              {content}
            </motion.span>
            <span className="text-roll-width" aria-hidden="true">{content}</span>
          </span>
        );
      })}
      <span className="sr-only">{children}</span>
    </span>
  );
}

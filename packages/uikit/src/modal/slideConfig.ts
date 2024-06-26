import { HTMLMotionProps, Variant } from 'framer-motion'

type MotionVariants<T extends string> = Record<T, Variant>

type ScaleMotionVariant = MotionVariants<'enter' | 'exit'>

const variants: ScaleMotionVariant = {
  exit: {
    y: '100%',
    transition: {
      duration: 0.2,
      easings: 'easeout',
    },
  },
  enter: {
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
      // ease: 'easeIn'
    },
  },
}

export const slideConfig: HTMLMotionProps<any> = {
  initial: 'exit',
  animate: 'enter',
  exit: 'exit',
  variants,
}

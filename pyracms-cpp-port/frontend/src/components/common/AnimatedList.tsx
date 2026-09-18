'use client'

import { motion } from 'framer-motion'

interface AnimatedListProps {
  children: React.ReactNode[]
  staggerDelay?: number
}

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

export default function AnimatedList({
  children, staggerDelay = 0.05,
}: AnimatedListProps) {
  const variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: staggerDelay } },
  }

  return (
    <motion.div variants={variants} initial="hidden" animate="show">
      {children.map((child, index) => (
        <motion.div key={index} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

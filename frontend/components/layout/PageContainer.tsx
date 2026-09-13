'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface PageContainerProps extends HTMLMotionProps<'div'> {
  size?: 'sm' | 'md' | 'lg' | 'full';
  children: React.ReactNode;
}

export function PageContainer({
  size = 'lg',
  className,
  children,
  ...props
}: PageContainerProps) {
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'mx-auto w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

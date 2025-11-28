import { ReactNode } from 'react';
import clsx from 'clsx';

export interface ContainerProps {
  /** The content to display inside the container */
  children: ReactNode;
  /** Optional additional CSS classes to apply */
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={clsx('mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
}

// src/components/ReactQueryDevTools.tsx

/**
 * React Query DevTools Component
 *
 * Conditionally renders React Query DevTools in development mode.
 * Provides debugging capabilities for queries and mutations.
 */

import React from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface ReactQueryDevToolsProps {
  /**
   * Whether to show the dev tools
   * @default true in development, false in production
   */
  show?: boolean;

  /**
   * Position of the dev tools toggle button
   * @default 'bottom-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /**
   * Initial state of the dev tools panel
   * @default false
   */
  initialIsOpen?: boolean;

  /**
   * Custom panel props
   */
  panelProps?: React.ComponentProps<typeof ReactQueryDevtools>;
}

export const ReactQueryDevTools: React.FC<ReactQueryDevToolsProps> = ({
  show = process.env.NODE_ENV === 'development',
  position = 'bottom-right',
  initialIsOpen = false,
  panelProps
}) => {
  // Don't render anything in production or if show is false
  if (!show) {
    return null;
  }

  return (
    <ReactQueryDevtools
      position={position}
      initialIsOpen={initialIsOpen}
      {...panelProps}
    />
  );
};

export default ReactQueryDevTools;
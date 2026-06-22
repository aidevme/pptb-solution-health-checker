import { useState, useCallback } from 'react';

/**
 * Shared expand/collapse state for card-row list components.
 *
 * @remarks
 * Enforces accordion behaviour — expanding any row auto-collapses the previously
 * expanded one, and toggling an already-expanded row collapses it to `null`.
 */
export function useExpandable() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggleExpand = useCallback((id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  }, []);
  return { expandedId, toggleExpand };
}

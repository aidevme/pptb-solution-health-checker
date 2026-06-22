import { useEffect } from 'react';

/**
 * Subscribes to PPTB connection lifecycle events and fires `onConnectionChange`
 * on `connection:created`, `connection:updated`, and `connection:deleted`.
 *
 * @remarks
 * The subscription is torn down on unmount. When `window.toolboxAPI?.events` is
 * absent (e.g. running outside PPTB Desktop or in tests) the hook is a no-op —
 * no error is thrown.
 *
 * PPTB Desktop's event bus passes the actual event name inside `payload.event`,
 * not as the first argument to the listener. This is the opposite of the Node.js
 * `EventEmitter` convention; the `_event` first parameter is intentionally ignored.
 *
 * @param onConnectionChange - Stabilise with `useCallback` to avoid re-subscribing on every render.
 */
export function useConnectionChange(onConnectionChange: () => void) {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.toolboxAPI?.events) {
      return;
    }

    const handleEvent = (_event: any, payload: any) => {
      if (
        payload?.event === 'connection:created' ||
        payload?.event === 'connection:updated' ||
        payload?.event === 'connection:deleted'
      ) {
        onConnectionChange();
      }
    };

    window.toolboxAPI.events.on(handleEvent);

    return () => {
      if (window.toolboxAPI?.events) {
        window.toolboxAPI.events.off(handleEvent);
      }
    };
  }, [onConnectionChange]);
}

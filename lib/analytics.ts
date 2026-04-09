/**
 * Analytics wrapper — swap provider without changing call sites.
 * Supports GA4 (gtag) and Microsoft Clarity.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
  }
}

/** Fire a custom event */
export function track(event: string, properties?: Record<string, unknown>) {
  try {
    // GA4
    if (window.gtag) {
      window.gtag('event', event, properties);
    }
    // Clarity custom tags
    if (window.clarity) {
      window.clarity('set', event, JSON.stringify(properties || {}));
    }
    // Dev logging
    if (import.meta.env.DEV) {
      console.log(`[analytics] ${event}`, properties);
    }
  } catch {
    // Silently fail — analytics should never crash the app
  }
}

/** Fire a page view */
export function trackPageView(path: string, title?: string) {
  try {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title || document.title,
      });
    }
    if (import.meta.env.DEV) {
      console.log(`[analytics] pageview: ${path}`);
    }
  } catch {
    // noop
  }
}

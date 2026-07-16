export const GA_TRACKING_ID = process.env.GA_TRACKING_ID as string;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any;
  category?: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
};

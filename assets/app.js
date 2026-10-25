// Demo analytics: events stored locally on this device only.
// Production uses the server event pipeline defined in marketing_analytics.
// Event contract: qr_scan, experience_start, target_found, content_engaged, cta_click, lead_submit
export function logEvent(type, extra = {}) {
  const params = new URLSearchParams(location.search);
  const evt = {
    type,
    campaign: 'nova-mind-techfest26',
    placement: params.get('p') || 'direct',
    ts: new Date().toISOString(),
    session: sessionStorage.getItem('nm_session') || (() => {
      const s = Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem('nm_session', s);
      return s;
    })(),
    ...extra,
  };
  const all = JSON.parse(localStorage.getItem('nm_events') || '[]');
  all.push(evt);
  localStorage.setItem('nm_events', JSON.stringify(all));
  return evt;
}

export function readEvents() {
  return JSON.parse(localStorage.getItem('nm_events') || '[]');
}

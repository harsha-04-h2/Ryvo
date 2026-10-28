// Demo analytics: events stored locally on this device only.
// Production uses the server event pipeline defined in marketing_analytics.
// Event contract: qr_scan, experience_start, target_found, content_engaged, cta_click, lead_submit
function safeRead() {
  try {
    const parsed = JSON.parse(localStorage.getItem('nm_events') || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function logEvent(type, extra = {}) {
  const params = new URLSearchParams(location.search);
  let session;
  try {
    session = sessionStorage.getItem('nm_session') || (() => {
      const s = Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem('nm_session', s);
      return s;
    })();
  } catch (e) {
    session = 'nosession';
  }
  const evt = {
    type,
    campaign: params.get('c') || 'nova-mind-techfest26',
    placement: params.get('p') || 'direct',
    ts: new Date().toISOString(),
    session,
    ...extra,
  };
  try {
    const all = safeRead();
    all.push(evt);
    localStorage.setItem('nm_events', JSON.stringify(all));
  } catch (e) {
    // Storage full/blocked: analytics must never break the experience.
    console.warn('logEvent: could not persist event', type, e);
  }
  return evt;
}

export function readEvents() {
  return safeRead();
}

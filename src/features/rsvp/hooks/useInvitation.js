import { useCallback, useEffect, useRef, useState } from 'react';
import { VIEW } from '../constants/rsvp.constants.js';
import { canChangeReply, emptyInvitation, loadInvitation } from '../services/rsvp.service.js';
import { readIdFromSearch } from '../utils/rsvp.utils.js';

/**
 * Loads this visitor's invitation once and owns which screen the RSVP card shows.
 * Use it anywhere the guest's name or pax is needed (invitation.guest.name / .pax), but call it only once
 * per page and pass the result down, so the Sheet is asked only once.
 */
export function useInvitation() {
  const [id] = useState(() => readIdFromSearch(window.location.search));
  const [state, setState] = useState(() => ({ view: VIEW.LOADING, invitation: emptyInvitation(id) }));
  const [busy, setBusy] = useState(false);
  const latest = useRef(0);

  const load = useCallback(async () => {
    const request = ++latest.current;
    setBusy(false);
    setState((s) => ({ ...s, view: VIEW.LOADING }));
    const next = await loadInvitation(id, { onBusy: () => { if (request === latest.current) setBusy(true); } });
    if (request !== latest.current) return; // a newer load started (Retry, or React StrictMode in dev)
    setBusy(false);
    setState(next);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const setView = useCallback((view) => setState((s) => ({ ...s, view })), []);
  const recordReply = useCallback((replied) => setState((s) => ({ ...s, invitation: { ...s.invitation, replied } })), []);

  return { view: state.view, invitation: state.invitation, canChange: canChangeReply(state.invitation), busy, retry: load, setView, recordReply };
}

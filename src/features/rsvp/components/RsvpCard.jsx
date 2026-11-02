import { useEffect, useRef } from 'react';
import { EVENT } from '../../../event.js';
import LotusRule from '../../../components/LotusRule.jsx';
import Reveal from '../../../components/Reveal.jsx';
import { VIEW } from '../constants/rsvp.constants.js';
import { useRsvpForm } from '../hooks/useRsvpForm.js';
import { STRINGS } from '../strings/rsvp.strings.js';
import { leadText, repliedMessage, thanksMessage } from '../utils/rsvp.utils.js';
import ContactLink from './ContactLink.jsx';
import GuestGreeting from './GuestGreeting.jsx';
import RsvpFormView from './RsvpFormView.jsx';
import RsvpNotice from './RsvpNotice.jsx';

const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasDetails = Boolean(EVENT.ceremony_datetime || EVENT.venue_name || EVENT.venue_address);
const NO_LEAD = [VIEW.INVALID, VIEW.CLOSED];

/**
 * The RSVP section: title, greeting, and whichever screen `view` says. Only renders; the decisions are in the service.
 * @param {{ invitation: ReturnType<import('../hooks/useInvitation.js').useInvitation> }} props
 */
export default function RsvpCard({ invitation: inv }) {
  const { view, invitation } = inv;
  const form = useRsvpForm(invitation, (outcome) => {
    if (outcome.replied) inv.recordReply(outcome.replied);
    go(outcome.view);
  });
  const viewRef = useRef(null);
  const shownView = useRef(view);
  const byGuest = useRef(false);

  // Fade the old screen out, swap, and the effect below brings the new one in.
  async function go(next) {
    if (!calm && viewRef.current) {
      const out = viewRef.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-in', fill: 'forwards' });
      await out.finished;
      out.cancel();
    }
    byGuest.current = true;
    inv.setView(next);
  }

  useEffect(() => {
    const from = shownView.current;
    if (from === view) return;
    shownView.current = view;
    // Loading and the form are the same element, so there is nothing to swap.
    if ((from === VIEW.LOADING && view === VIEW.FORM) || !viewRef.current) return;
    if (!calm) {
      viewRef.current.animate(
        [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
        { duration: 380, easing: 'ease-out' },
      );
    }
    // Only a change the guest caused may move focus or scroll the page, never the first load.
    if (!byGuest.current) return;
    byGuest.current = false;
    if (view !== VIEW.FORM) viewRef.current.focus({ preventScroll: true });
    document.getElementById('rsvp').scrollIntoView({ block: view === VIEW.FORM ? 'start' : 'center' });
  }, [view]);

  function changeReply() {
    form.prefill();
    go(VIEW.FORM);
  }

  const changeAction = inv.canChange
    ? <button type="button" className="link-btn" onClick={changeReply}>{STRINGS.change}</button>
    : null;

  let screen;
  if (view === VIEW.LOADING || view === VIEW.FORM) {
    screen = <RsvpFormView ref={viewRef} form={form} invitation={invitation} disabled={view === VIEW.LOADING} />;
  } else if (view === VIEW.THANKS) {
    const name = invitation.guest ? invitation.guest.name : form.values.name.trim();
    screen = (
      <RsvpNotice ref={viewRef} dove title={STRINGS.thanksTitle} message={thanksMessage(invitation.replied, name)}>
        {changeAction}
      </RsvpNotice>
    );
  } else if (view === VIEW.REPLIED) {
    screen = (
      <RsvpNotice ref={viewRef} dove title={STRINGS.thanksTitle} message={repliedMessage(invitation.replied)}>
        {changeAction || (
          <>
            <p>{STRINGS.changeClosed}</p>
            <ContactLink url={invitation.contactUrl} />
          </>
        )}
      </RsvpNotice>
    );
  } else if (view === VIEW.LOAD_ERROR) {
    screen = (
      <RsvpNotice ref={viewRef} message={STRINGS.loadError}>
        <button type="button" className="submit" onClick={inv.retry}>{STRINGS.tryAgain}</button>
      </RsvpNotice>
    );
  } else {
    screen = (
      <RsvpNotice ref={viewRef} message={view === VIEW.INVALID ? STRINGS.invalid : STRINGS.closed}>
        <ContactLink url={invitation.contactUrl} />
      </RsvpNotice>
    );
  }

  return (
    <Reveal className="rsvp" id="rsvp" aria-labelledby="rsvp-title">
      <LotusRule className="rsvp-crown" />
      <h2 id="rsvp-title">{STRINGS.title}</h2>
      <GuestGreeting invitation={invitation} view={view} busy={inv.busy} />
      {!NO_LEAD.includes(view) && <p className="rsvp-lead">{leadText(hasDetails, invitation.deadline)}</p>}
      {screen}
    </Reveal>
  );
}

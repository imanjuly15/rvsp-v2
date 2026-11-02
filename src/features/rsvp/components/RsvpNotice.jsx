import Art from '../../../lib/art.js';

// Static drawing from lib/art.js, never user text.
const doveArt = { __html: Art.doveMarkup() };

/**
 * A centred message in the design's .thanks panel: thank-you, already replied, invalid link, closed, load error.
 * `dove` adds the flying dove and `title` the script heading, as on the original thank-you panel.
 */
export default function RsvpNotice({ ref, dove, title, message, children }) {
  return (
    <div ref={ref} className="thanks" tabIndex={-1}>
      {dove && (
        <div className="thanks-dove" aria-hidden="true">
          <div className="dove" dangerouslySetInnerHTML={doveArt} />
        </div>
      )}
      {title && <p className="script">{title}</p>}
      <p>{message}</p>
      {children}
    </div>
  );
}

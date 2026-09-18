const HIDDEN = {
  position: 'absolute', left: '-9999px', top: 'auto', width: '1px',
  height: '1px', overflow: 'hidden', zIndex: 9999,
} as const

const SHOWN = {
  position: 'fixed', left: '16px', top: '16px', width: 'auto',
  height: 'auto', overflow: 'visible', background: '#fff',
  padding: '8px 16px', border: '2px solid #1976d2', borderRadius: '4px',
  color: '#1976d2', fontWeight: '700', textDecoration: 'none',
} as const

/** Keyboard-only "skip to content" link, revealed on focus. */
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-to-content"
      data-testid="skip-to-content"
      style={HIDDEN}
      onFocus={(e) => Object.assign(e.currentTarget.style, SHOWN)}
      onBlur={(e) => Object.assign(e.currentTarget.style, HIDDEN)}
    >
      Skip to main content
    </a>
  )
}

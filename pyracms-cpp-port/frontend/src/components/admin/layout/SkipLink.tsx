import type { FocusEvent } from 'react'

const HIDDEN = {
  position: 'absolute', left: '-9999px',
  width: '1px', height: '1px',
  overflow: 'hidden',
}

const SHOWN = {
  position: 'fixed', left: '16px', top: '16px',
  width: 'auto', height: 'auto',
  overflow: 'visible', background: '#fff',
  padding: '8px 16px',
  border: '2px solid #1976d2',
  borderRadius: '4px', color: '#1976d2',
  fontWeight: '700', textDecoration: 'none',
}

function apply(
  e: FocusEvent<HTMLAnchorElement>,
  styles: Record<string, string>,
) {
  Object.assign(e.currentTarget.style, styles)
}

export default function SkipLink() {
  return (
    <a
      href="#admin-main-content"
      className="skip-to-content"
      data-testid="skip-to-content"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        zIndex: 9999,
      }}
      onFocus={(e) => apply(e, SHOWN)}
      onBlur={(e) => apply(e, HIDDEN)}
    >
      Skip to main content
    </a>
  )
}

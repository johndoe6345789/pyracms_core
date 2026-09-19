/** Full-page navigation (kept separate so tests can stub it). */
export function goTo(url: string): void {
  window.location.assign(url)
}

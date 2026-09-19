export class FakeWs {
  static OPEN = 1
  static all: FakeWs[] = []
  readyState = 1
  sent: string[] = []
  closed = false
  onopen: () => void = () => {}
  onclose: (() => void) | null = () => {}
  onerror: () => void = () => {}
  onmessage: (e: { data: string }) => void = () => {}
  constructor(public url: string) {
    FakeWs.all.push(this)
  }
  send(d: string) {
    this.sent.push(d)
  }
  close() {
    this.closed = true
    this.onclose?.()
  }
}

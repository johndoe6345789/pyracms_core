import type React from 'react'

export interface MockFormEvent {
  event: React.FormEvent
  preventDefault: jest.Mock
}

export function makeMockFormEvent(): MockFormEvent {
  const preventDefault = jest.fn()

  return {
    event: { preventDefault } as unknown as React.FormEvent,
    preventDefault,
  }
}

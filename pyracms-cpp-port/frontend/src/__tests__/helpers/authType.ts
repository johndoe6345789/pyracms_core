import { screen, fireEvent } from '@testing-library/react'

/** Type a value into the element with the given test id. */
export const type = (id: string, v: string) =>
  fireEvent.change(screen.getByTestId(id), { target: { value: v } })

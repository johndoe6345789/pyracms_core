import { screen, fireEvent } from '@testing-library/react'

/** Change the input found by test id. */
export const typeInto = (id: string, v: string) =>
  fireEvent.change(screen.getByTestId(id), { target: { value: v } })

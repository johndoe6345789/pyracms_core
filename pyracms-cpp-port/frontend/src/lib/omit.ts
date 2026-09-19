/** Copy of `obj` without `key` (avoids unused-variable destructuring). */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  key: K,
): Omit<T, K> {
  const copy = { ...obj }
  delete copy[key]
  return copy
}

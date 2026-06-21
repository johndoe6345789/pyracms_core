type AnyFunction = (...args: never[]) => unknown

export function asMockedFunction<FunctionType extends AnyFunction>(
  value: FunctionType,
) {
  return value as jest.MockedFunction<FunctionType>
}

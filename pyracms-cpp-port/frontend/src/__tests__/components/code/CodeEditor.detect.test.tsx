import { detectLanguage } from '@/components/code/languages'

describe('detectLanguage', () => {
  it.each([
    ['def a():\n print(1)', 'python'],
    ['const a = 1', 'javascript'],
    ['#include <x>', 'cpp'],
    ['fn main() { let mut a }', 'rust'],
    ['package main\nfunc a() {}', 'go'],
    ['public class A {}', 'java'],
    ['hello', null],
  ])('%s -> %s', (code, lang) => {
    expect(detectLanguage(code)).toBe(lang)
  })
})

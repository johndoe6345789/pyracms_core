import { detectLanguage } from '@/components/code/languages'

describe('detectLanguage', () => {
  it.each([
    ['def a():\n print(1)', 'python'],
    ['const a = 1', 'javascript'],
    ['#include <x>', 'cpp'],
    ['#include <stdio.h>\nint main(){}', 'c'],
    ['#include <stdio.h>\nstd::string a', 'cpp'],
    ['#include <string.h>\nusing namespace std;', 'cpp'],
    ['fn main() { let mut a }', 'rust'],
    ['package main\nfunc a() {}', 'go'],
    ['public class A {}', 'java'],
    ['hello', null],
  ])('%s -> %s', (code, lang) => {
    expect(detectLanguage(code)).toBe(lang)
  })
})

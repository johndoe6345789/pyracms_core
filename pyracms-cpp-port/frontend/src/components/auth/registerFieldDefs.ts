import type { RegisterRequest } from '@/types'

export interface FieldDef {
  name: keyof RegisterRequest
  label: string
  testId: string
  aria: string
  type?: string
  required?: boolean
}

export const FIELDS: FieldDef[] = [
  {
    name: 'username',
    label: 'Username',
    required: true,
    testId: 'register-username-input',
    aria: 'Username',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    testId: 'register-email-input',
    aria: 'Email address',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    required: true,
    testId: 'register-password-input',
    aria: 'Password',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password',
    required: true,
    testId: 'register-confirm-password-input',
    aria: 'Confirm password',
  },
  {
    name: 'firstName',
    label: 'First Name',
    testId: 'register-firstname-input',
    aria: 'First name',
  },
  {
    name: 'lastName',
    label: 'Last Name',
    testId: 'register-lastname-input',
    aria: 'Last name',
  },
]

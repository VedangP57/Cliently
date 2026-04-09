import { describe, expect, it } from 'vitest'
import { loginSchema, signupSchema } from '@/lib/validations/auth'

describe('auth validation schemas', () => {
  it('loginSchema rejects invalid email', () => {
    const parsed = loginSchema.safeParse({
      email: 'invalid-email',
      password: '123456',
    })

    expect(parsed.success).toBe(false)
  })

  it('loginSchema rejects password under 6 characters', () => {
    const parsed = loginSchema.safeParse({
      email: 'user@example.com',
      password: '12345',
    })

    expect(parsed.success).toBe(false)
  })

  it('signupSchema rejects name under 2 characters', () => {
    const parsed = signupSchema.safeParse({
      full_name: 'A',
      email: 'user@example.com',
      password: '123456',
      confirm_password: '123456',
    })

    expect(parsed.success).toBe(false)
  })

  it('signupSchema rejects mismatched passwords', () => {
    const parsed = signupSchema.safeParse({
      full_name: 'Jane Doe',
      email: 'user@example.com',
      password: '123456',
      confirm_password: 'abcdef',
    })

    expect(parsed.success).toBe(false)
  })
})

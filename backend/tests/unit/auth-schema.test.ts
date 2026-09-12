import { describe, it, expect } from 'vitest';
import { LoginSchema, SignupSchema } from '@shared/schemas/auth';

describe('Auth Schemas', () => {
  describe('LoginSchema', () => {
    it('accepts valid email and password', () => {
      const result = LoginSchema.safeParse({
        email: 'hero@liferpg.dev',
        password: 'securepassword123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email formats', () => {
      const result = LoginSchema.safeParse({
        email: 'not-an-email',
        password: 'securepassword123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects passwords shorter than 6 characters', () => {
      const result = LoginSchema.safeParse({
        email: 'hero@liferpg.dev',
        password: '123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('SignupSchema', () => {
    it('accepts valid signup input matching passwords', () => {
      const result = SignupSchema.safeParse({
        displayName: 'Solon',
        email: 'solon@liferpg.dev',
        password: 'mypassword123',
        confirmPassword: 'mypassword123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
      const result = SignupSchema.safeParse({
        displayName: 'Solon',
        email: 'solon@liferpg.dev',
        password: 'mypassword123',
        confirmPassword: 'differentpassword',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Passwords do not match');
      }
    });
  });
});

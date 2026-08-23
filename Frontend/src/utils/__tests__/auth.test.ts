import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword } from '../auth';

describe('validateEmail', () => {
  it('accepts a normal email address', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('rejects an address with no @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('rejects an address with no domain', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  it('rejects an address with no TLD', () => {
    expect(validateEmail('user@example')).toBe(false);
  });

  it('rejects an address containing whitespace', () => {
    expect(validateEmail('user @example.com')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(validateEmail('')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('rejects a password shorter than 8 characters', () => {
    const result = validatePassword('Aa1!aaa');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('At least 8 characters');
  });

  it('rejects a password missing an uppercase letter', () => {
    const result = validatePassword('aa1!aaaa');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('One uppercase letter');
  });

  it('rejects a password missing a lowercase letter', () => {
    const result = validatePassword('AA1!AAAA');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('One lowercase letter');
  });

  it('rejects a password missing a number', () => {
    const result = validatePassword('Aa!aaaaa');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('One number');
  });

  it('rejects a password missing a special character', () => {
    const result = validatePassword('Aa1aaaaa');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('One special character');
  });

  it('accepts a password meeting all requirements', () => {
    const result = validatePassword('Aa1!aaaa');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rates a minimal valid password as medium, not strong', () => {
    // Regression test: every character-class check is already guaranteed
    // true once a password is valid, so scoring off those checks made
    // "medium" mathematically unreachable -- every valid password came back
    // "strong", even a bare 8-character one. Length is the only thing left
    // that can actually distinguish strength once validity is established.
    const result = validatePassword('Aa1!aaaa'); // exactly 8 chars, valid
    expect(result.isValid).toBe(true);
    expect(result.strength).toBe('medium');
  });

  it('rates a long valid password as strong', () => {
    const result = validatePassword('Aa1!aaaaaaaaaa'); // 14 chars, valid
    expect(result.isValid).toBe(true);
    expect(result.strength).toBe('strong');
  });

  it('never rates an invalid password as medium or strong', () => {
    const result = validatePassword('short');
    expect(result.strength).toBe('weak');
  });
});

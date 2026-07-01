export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'delivery' | 'supervisor' | 'customer';
  phone_number?: string;
  email_verified: boolean;
  avatar: string;
}

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('One special character');

  const isValid = errors.length === 0;

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (isValid) {
    const score = (password.length >= 12 ? 1 : 0)
      + (/[A-Z]/.test(password) ? 1 : 0)
      + (/[a-z]/.test(password) ? 1 : 0)
      + (/[0-9]/.test(password) ? 1 : 0)
      + (/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 1 : 0);

    if (score >= 4) strength = 'strong';
    else if (score >= 3) strength = 'medium';
  }

  return { isValid, errors, strength };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "staff" | "staffsupervisor" | "customer";
  phone_number?: string;
  email_verified: boolean;
  avatar: string;
}

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("One number");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    errors.push("One special character");

  const isValid = errors.length === 0;

  // Once a password is valid, it has already satisfied all four character-
  // class checks -- they can no longer distinguish anything. Length is the
  // only remaining signal, so it alone determines the medium/strong split.
  let strength: "weak" | "medium" | "strong" = "weak";
  if (isValid) {
    strength = password.length >= 14 ? "strong" : "medium";
  }

  return { isValid, errors, strength };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

import { describe, it, expect } from 'vitest';
import { validateProductForm, validateBrandForm } from '../productValidation';

describe('validateProductForm', () => {
  const validForm = {
    name: 'Multi-Surface Spray',
    brandId: 1,
    category: 'kitchen',
    variants: [{ size: '500ml', price: 450 }],
  };

  it('returns no errors for a valid form', () => {
    expect(validateProductForm(validForm)).toEqual([]);
  });

  it('rejects a missing or too-short name', () => {
    expect(validateProductForm({ ...validForm, name: '' })).toContain(
      'Product name must be at least 2 characters.'
    );
    expect(validateProductForm({ ...validForm, name: 'A' })).toContain(
      'Product name must be at least 2 characters.'
    );
  });

  it('rejects a missing brand', () => {
    expect(validateProductForm({ ...validForm, brandId: undefined })).toContain(
      'Please select a brand.'
    );
  });

  it('rejects a missing category', () => {
    expect(validateProductForm({ ...validForm, category: undefined })).toContain(
      'Please select a category.'
    );
  });

  it('rejects an empty variants list', () => {
    expect(validateProductForm({ ...validForm, variants: [] })).toContain(
      'At least one variant is required.'
    );
  });

  it('rejects a variant with a zero or negative price', () => {
    const errors = validateProductForm({
      ...validForm,
      variants: [{ size: '500ml', price: 0 }],
    });
    expect(errors.some((e) => e.includes('price must be greater than 0'))).toBe(true);
  });

  it('rejects a variant with a blank size', () => {
    const errors = validateProductForm({
      ...validForm,
      variants: [{ size: '', price: 100 }],
    });
    expect(errors.some((e) => e.includes('size is required'))).toBe(true);
  });

  it('rejects duplicate variant sizes (case-insensitive)', () => {
    const errors = validateProductForm({
      ...validForm,
      variants: [
        { size: '500ml', price: 100 },
        { size: '500ML', price: 200 },
      ],
    });
    expect(errors.some((e) => e.includes('Duplicate size'))).toBe(true);
  });

  it('accepts multiple distinct variants', () => {
    const errors = validateProductForm({
      ...validForm,
      variants: [
        { size: '500ml', price: 100 },
        { size: '1L', price: 180 },
        { size: '4L', price: 650 },
      ],
    });
    expect(errors).toEqual([]);
  });
});

describe('validateBrandForm', () => {
  it('accepts a valid, unique brand name', () => {
    expect(validateBrandForm('NewBrand', ['dash', 'cleana'])).toEqual([]);
  });

  it('rejects a name that is too short', () => {
    expect(validateBrandForm('A', [])).toContain('Brand name must be at least 2 characters.');
  });

  it('rejects a duplicate name, case-insensitively', () => {
    expect(validateBrandForm('DASH', ['dash', 'cleana'])).toContain(
      'A brand with this name already exists.'
    );
  });

  it('trims whitespace before checking length and duplicates', () => {
    expect(validateBrandForm('  Dash  ', ['dash'])).toContain(
      'A brand with this name already exists.'
    );
  });
});
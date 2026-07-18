export interface ProductVariantFormData {
  size: string;
  price: number;
}

export interface ProductFormData {
  name?: string;
  brandId?: number;
  category?: string;
  variants?: ProductVariantFormData[];
}

export function validateProductForm(data: ProductFormData): string[] {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Product name must be at least 2 characters.');
  }
  if (!data.brandId) {
    errors.push('Please select a brand.');
  }
  if (!data.category) {
    errors.push('Please select a category.');
  }
  if (!data.variants || data.variants.length === 0) {
    errors.push('At least one variant is required.');
  } else {
    data.variants.forEach((v, i) => {
      if (!v.size || v.size.trim().length === 0) {
        errors.push(`Variant ${i + 1}: size is required.`);
      }
      if (!v.price || v.price <= 0) {
        errors.push(`Variant ${i + 1} (${v.size || 'unnamed'}): price must be greater than 0.`);
      }
    });

    const sizes = data.variants.map((v) => v.size.trim().toLowerCase()).filter(Boolean);
    const duplicates = sizes.filter((s, i) => sizes.indexOf(s) !== i);
    if (duplicates.length > 0) {
      errors.push(`Duplicate size(s) found: ${[...new Set(duplicates)].join(', ')}. Each variant needs a unique size.`);
    }
  }

  return errors;
}

export function validateBrandForm(name: string, existingNames: string[]): string[] {
  const errors: string[] = [];
  const trimmed = name.trim();

  if (trimmed.length < 2) {
    errors.push('Brand name must be at least 2 characters.');
  }
  if (existingNames.includes(trimmed.toLowerCase())) {
    errors.push('A brand with this name already exists.');
  }

  return errors;
}
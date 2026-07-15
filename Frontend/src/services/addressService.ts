import api from './api';
import type { Address } from '../types';

export type AddressInput = Omit<Address, 'id'>;

interface ApiAddress {
  id: number;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default: boolean;
}

function toFrontendAddress(a: ApiAddress): Address {
  return {
    id: String(a.id),
    label: a.label,
    street: a.street,
    city: a.city,
    state: a.state,
    zip: a.zip,
    country: a.country,
    isDefault: a.is_default,
  };
}

export const addressService = {
  async list() {
    const { data } = await api.get('/customer/addresses');
    return (data.data as ApiAddress[]).map(toFrontendAddress);
  },

  async create(payload: AddressInput) {
    const { data } = await api.post('/customer/addresses', payload);
    return toFrontendAddress(data.data as ApiAddress);
  },

  async update(id: string, payload: AddressInput) {
    const { data } = await api.put(`/customer/addresses/${id}`, payload);
    return toFrontendAddress(data.data as ApiAddress);
  },

  async remove(id: string) {
    await api.delete(`/customer/addresses/${id}`);
  },
};

export default addressService;
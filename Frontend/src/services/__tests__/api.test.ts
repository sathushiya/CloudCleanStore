import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  refreshSession,
  getAccessToken,
  setAccessToken,
  clearAuthStorage,
} from '../api';

describe('refreshSession', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setAccessToken(null);
  });

  it('makes only ONE network call when called twice at the same time', async () => {
    let resolvePost!: (value: unknown) => void;
    const postSpy = vi.spyOn(axios, 'post').mockImplementation(
      () => new Promise((resolve) => { resolvePost = resolve; }),
    );

    // e.g. React StrictMode running the AuthContext effect twice
    const first = refreshSession();
    const second = refreshSession();

    resolvePost({ data: { data: { tokens: { access_token: 'new-access' } } } });

    await expect(first).resolves.toBe('new-access');
    await expect(second).resolves.toBe('new-access');
    expect(postSpy).toHaveBeenCalledTimes(1);

    // Cookie-only: no refresh token in the body, credentials included.
    const [url, body, config] = postSpy.mock.calls[0];
    expect(url).toMatch(/\/auth\/refresh$/);
    expect(body).toEqual({});
    expect(config).toMatchObject({ withCredentials: true });

    expect(getAccessToken()).toBe('new-access');
  });

  it('starts a new request once the previous one has settled', async () => {
    const postSpy = vi.spyOn(axios, 'post')
      .mockResolvedValue({ data: { data: { tokens: { access_token: 't' } } } });

    await refreshSession();
    await refreshSession();

    expect(postSpy).toHaveBeenCalledTimes(2);
  });

  it('returns null and clears the in-memory token when refresh fails', async () => {
    setAccessToken('stale');
    vi.spyOn(axios, 'post').mockRejectedValue({ response: { status: 401 } });

    await expect(refreshSession()).resolves.toBeNull();
    expect(getAccessToken()).toBeNull();
  });
});

describe('clearAuthStorage', () => {
  it('clears the memory token and legacy storage keys but keeps the cart', () => {
    setAccessToken('abc');
    for (const s of [localStorage, sessionStorage]) {
      ['access_token', 'refresh_token', 'auth_storage', 'cloudclean_user'].forEach((k) => s.setItem(k, 'x'));
    }
    localStorage.setItem('cloudclean_cart', '[1]');

    clearAuthStorage();

    expect(getAccessToken()).toBeNull();
    for (const s of [localStorage, sessionStorage]) {
      ['access_token', 'refresh_token', 'auth_storage', 'cloudclean_user'].forEach((k) => {
        expect(s.getItem(k)).toBeNull();
      });
    }
    expect(localStorage.getItem('cloudclean_cart')).toBe('[1]');
  });
});

import { createHmac, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';

/* ------------------------------------------------------------------ */
/*  Configuration                                                      */
/* ------------------------------------------------------------------ */

const COOKIE_NAME = 'admin_session';
/** 24 hours in milliseconds. */
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

/* ------------------------------------------------------------------ */
/*  HMAC signing helpers                                               */
/* ------------------------------------------------------------------ */

function getSecret(): string {
  const secret: string | undefined = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is not configured. Set it in your .env file.');
  }
  return secret;
}

/** Sign the expiry timestamp with HMAC-SHA256 using the session secret. */
function sign(expiresTimestamp: string): string {
  return createHmac('sha256', getSecret()).update(expiresTimestamp).digest('hex');
}

/**
 * Compare two hex strings in constant time to prevent timing attacks.
 * Returns false if lengths differ or if the values don't match.
 */
function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/* ------------------------------------------------------------------ */
/*  Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * Validate the admin password and, on success, set a signed session cookie
 * valid for 24 hours.
 *
 * @returns `true` if the password was correct and the session was created,
 *          `false` if the password was incorrect.
 * @throws  if `ADMIN_PASSWORD` is not configured.
 */
export function createSession(cookies: AstroCookies, password: string): boolean {
  const adminPassword: string | undefined = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD is not configured. Set it in your .env file.');
  }
  if (password !== adminPassword) {
    return false;
  }

  const expiresTimestamp = String(Date.now() + SESSION_DURATION_MS);
  const signature = sign(expiresTimestamp);
  const cookieValue = `${expiresTimestamp}.${signature}`;

  cookies.set(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_MS / 1000,
  });

  return true;
}

/**
 * Check whether the current request has a valid, unexpired admin session.
 *
 * Returns `false` (never throws) when:
 *  - `SESSION_SECRET` is not configured,
 *  - the cookie is absent,
 *  - the cookie format is invalid,
 *  - the HMAC signature doesn't match (tampered cookie),
 *  - the session has expired.
 */
export function isAuthenticated(cookies: AstroCookies): boolean {
  const secret: string | undefined = process.env.SESSION_SECRET;
  if (!secret) {
    return false;
  }

  const cookie = cookies.get(COOKIE_NAME);
  if (!cookie) {
    return false;
  }

  const value: string = cookie.value;
  const parts = value.split('.');
  if (parts.length !== 2) {
    return false;
  }

  const [expiresTimestamp, signature] = parts;

  // Verify the HMAC signature.
  const expectedSignature = sign(expiresTimestamp);
  if (!safeEqualHex(signature, expectedSignature)) {
    return false;
  }

  // Check that the session hasn't expired.
  const expires = Number.parseInt(expiresTimestamp, 10);
  if (Number.isNaN(expires)) {
    return false;
  }
  if (Date.now() >= expires) {
    return false;
  }

  return true;
}

/** Clear the admin session cookie, effectively logging the user out. */
export function clearSession(cookies: AstroCookies): void {
  cookies.delete(COOKIE_NAME, { path: '/' });
}

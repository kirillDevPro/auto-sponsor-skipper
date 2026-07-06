/**
 * background/hash.js — leaf module: SHA-256 hex-prefix of a string via the
 * native Web Crypto API (available in the MV3 service worker). Used to build
 * the SponsorBlock privacy hash-prefix so the full videoID never leaves the
 * browser.
 */

/**
 * Compute the first `len` lowercase-hex characters of SHA-256(text).
 * @param {string} text - input string (the 11-char YouTube videoID).
 * @param {number} len - number of leading hex chars to return (e.g. 4).
 * @returns {Promise<string>} lowercase hex prefix of the digest.
 */
export async function sha256HexPrefix(text, len) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.slice(0, len);
}

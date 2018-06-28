import cookie from 'cookie';

/**
 * Get a cookie.
 * @param {String} name - Name of cookie.
 * @returns {?String} Cookie value, or `undefined` if not set.
 */
export default function getCookie(name) {
  if (!name) {
    throw new TypeError('You must specify the name of a cookie to get.');
  }

  if (typeof name !== 'string') {
    throw new TypeError(`Expected cookie name to be a string, but got ${typeof name}`);
  }

  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = cookie.parse(document.cookie);

  return cookies[name];
}

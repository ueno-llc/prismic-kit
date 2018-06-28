/* eslint-env mocha */

import { expect } from 'chai';
import getCookie from '../src/get-cookie';

describe('getCookie()', () => {
  it('throws a TypeError if no name is set', () => {
    expect(() => getCookie()).to.throw(TypeError);
  });

  it('throws a TypeError if name is not a string', () => {
    expect(() => getCookie([])).to.throw(TypeError);
  });

  it('returns null if not in a browser environment', () => {
    expect(getCookie('kittens')).to.equal(null);
  });

  describe('Browser environment', () => {
    before(() => {
      global.document = {
        cookie: 'kittens=true',
      };
    });

    after(() => {
      delete global.document;
    });

    it('returns a cookie', () => {
      expect(getCookie('kittens')).to.equal('true');
    });

    it('returns undefined if there is no cookie', () => {
      expect(getCookie('puppies')).to.equal(undefined);
    });
  });
});

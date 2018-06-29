import { expect } from 'chai';
import requireUncached from 'require-uncached';

const loadModule = () => requireUncached('../src').default;

describe('PrismicKit', () => {
  describe('config()', () => {
    it('throws a TypeError if no Prismic repo is set', () => {
      const PrismicKit = loadModule();

      expect(() => {
        PrismicKit.config({});
      }).to.throw(TypeError);
    });

    it('throws a TypeError if Prismic repo is not a string', () => {
      const PrismicKit = loadModule();

      expect(() => {
        PrismicKit.config({ repoName: [] });
      }).to.throw(TypeError);
    });

    it('throws a TypeError if Prismic access token is not a string', () => {
      const PrismicKit = loadModule();

      expect(() => {
        PrismicKit.config({ repoName: 'repo', accessToken: [] });
      }).to.throw(TypeError);
    });

    it('throws a TypeError if Prismic link resovler is not a function', () => {
      const PrismicKit = loadModule();

      expect(() => {
        PrismicKit.config({ repoName: 'repo' });
      }).to.throw(TypeError);
    });

    it('can also fetch the config', () => {
      const PrismicKit = loadModule();
      const config = {
        repoName: 'repo',
        accessToken: 'kittens',
        linkResolver: () => '/',
      };

      PrismicKit.config(config);
      expect(PrismicKit.config()).to.eql(config);
    });
  });
});

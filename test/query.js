/* eslint-env mocha */

import { expect } from 'chai';
import sinon from 'sinon';
import Prismic from 'prismic-javascript';
import query from '../src/query';

const repoName = 'repo';
const accessToken = 'kittens';

const mockPrismicApi = Symbol('mockPrismicApi');

describe('query()', () => {
  before(() => sinon.stub(Prismic, 'getApi').resolves(mockPrismicApi));

  afterEach(() => Prismic.getApi.resetHistory());

  after(() => Prismic.getApi.restore());

  it('throws a TypeError if no repo name is set', () => {
    expect(() => query()).to.throw(TypeError);
  });

  it('throws a TypeError if repo name is not a string', () => {
    expect(() => query([])).to.throw(TypeError);
  });

  it('throws a TypeError if access token is not a string', () => {
    expect(() => query({ repoName, accessToken: [] })).to.throw(TypeError);
  });

  it('returns a function', () => {
    expect(query({ repoName })).to.be.a('function');
  });

  describe('queryPrismic()', () => {
    it('throws an error if no callback is provided', () => {
      const queryPrismic = query({ repoName });

      expect(() => queryPrismic()).to.throw(TypeError);
    });

    it('returns a function', () => {
      const queryPrismic = query({ repoName });

      expect(queryPrismic(() => {})).to.be.a('function');
    });

    it('returns the result of the callback in a Promise', () => {
      const result = Symbol('result');
      const callback = sinon.stub().returns(result);
      const queryPrismic = query({ repoName });
      const runQuery = queryPrismic(callback);

      return runQuery().then((res) => {
        expect(res).to.equal(result);
      });
    });

    it('calls Prismic.getApi() with repo name and access token', () => {
      const queryPrismic = query({ repoName, accessToken });
      const runQuery = queryPrismic(() => {});

      return runQuery().then(() => {
        expect(Prismic.getApi).to.have.been.calledWithExactly(
          `https://${repoName}.prismic.io/api/v2`,
          { accessToken },
        );
      });
    });

    it('passes an API wrapper to the callback', () => {
      const callback = sinon.spy();
      const queryPrismic = query({ repoName });
      const runQuery = queryPrismic((...args) => {
        callback(...args);
      });

      return runQuery().then(() => {
        expect(callback).to.have.been.calledWithExactly(mockPrismicApi, undefined);
      });
    });

    it('passes the first argument of the query function as the second argument of the callback', () => {
      const callback = sinon.spy();
      const props = Symbol('props');
      const queryPrismic = query({ repoName });
      const runQuery = queryPrismic(callback);

      return runQuery(props).then(() => {
        expect(callback).to.have.been.calledWithExactly(mockPrismicApi, props);
      });
    });

    it('always returns a new API wrapper on the server', () => {
      const queryPrismic = query({ repoName });
      const runQuery = queryPrismic(() => {});

      return runQuery().then(() => runQuery()).then(() => {
        expect(Prismic.getApi).to.have.callCount(2);
      });
    });

    describe('Browser Environment', () => {
      beforeEach(() => {
        global.window = {};
      });

      afterEach(() => {
        delete global.window;
        Prismic.getApi.reset();
      });

      it('caches the API wrapper on subsequent calls', () => {
        const queryPrismic = query({ repoName });
        const runQuery = queryPrismic(() => {});

        return runQuery().then(() => runQuery()).then(() => {
          expect(Prismic.getApi).to.have.callCount(1);
        });
      });
    });
  });
});

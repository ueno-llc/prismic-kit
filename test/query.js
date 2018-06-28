/* eslint-env mocha */

import { expect } from 'chai';
import sinon from 'sinon';
import Prismic from 'prismic-javascript';
import PrismicKit from '../src';
import queryPrismic from '../src/query';

const repoName = 'repo';
const accessToken = 'kittens';
const mockPrismicApi = Symbol('mockPrismicApi');

describe('queryPrismic()', () => {
  before(() => {
    sinon.stub(Prismic, 'getApi').resolves(mockPrismicApi);
    PrismicKit.config({ repoName, accessToken });
  });

  afterEach(() => Prismic.getApi.resetHistory());

  after(() => {
    Prismic.getApi.restore();
    delete require.cache[require.resolve('../src')];
  });

  it('throws an error if no callback is provided', () => {
    expect(() => queryPrismic()).to.throw(TypeError);
  });

  it('returns a function', () => {
    expect(queryPrismic(() => {})).to.be.a('function');
  });

  it('returns the result of the callback in a Promise', () => {
    const result = Symbol('result');
    const callback = sinon.stub().returns(result);
    const runQuery = queryPrismic(callback);

    return runQuery().then((res) => {
      expect(res).to.equal(result);
    });
  });

  it('calls Prismic.getApi() with repo name and access token', () => {
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
    const runQuery = queryPrismic(callback);

    return runQuery(props).then(() => {
      expect(callback).to.have.been.calledWithExactly(mockPrismicApi, props);
    });
  });

  it('always returns a new API wrapper on the server', () => {
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
      const runQuery = queryPrismic(() => {});

      return runQuery().then(() => runQuery()).then(() => {
        expect(Prismic.getApi).to.have.callCount(1);
      });
    });
  });
});

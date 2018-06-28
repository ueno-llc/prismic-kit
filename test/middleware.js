/* eslint-env mocha */

import { expect } from 'chai';
import sinon from 'sinon';
import Prismic from 'prismic-javascript';
import PrismicKit from '../src';
import middleware from '../src/middleware';
import testRoute from './util/test-route';

const repoName = 'repo';
const accessToken = 'accessToken';
const webhookCallback = () => {};
const webhookSecret = 'kittens';
const previewToken = 'kittens';
const previewUrl = '/hello';
const linkResolver = () => {};

describe('Express middleware', () => {
  before(() => {
    PrismicKit.config({ repoName, accessToken });
  });

  after(() => {
    delete require.cache[require.resolve('../src')];
  });

  it('throws a TypeError if the webhook callback is not a function', () => {
    expect(() => middleware({ repoName, webhookCallback: [] })).to.throw(TypeError);
  });

  it('throws a TypeError if a webhook secret is defined without a webhook function', () => {
    expect(() => middleware({ repoName, webhookSecret })).to.throw(TypeError);
  });

  describe('/webhook', () => {
    it('returns 404 if no webhook function is defined', () => {
      const test = testRoute(middleware({ repoName }));

      return test('post', '/webhook', {}).then((res) => {
        expect(res.sendStatus).to.have.been.calledWith(404);
      });
    });

    it('returns 400 if a secret is sent, but no secret is configured', () => {
      const test = testRoute(middleware({ repoName, webhookCallback }));
      const req = {
        body: {
          secret: webhookSecret,
        },
      };

      return test('post', '/webhook', req).then((res) => {
        expect(res.sendStatus).to.have.been.calledWith(400);
      });
    });

    it('returns 401 if a secret is sent, but it doesn\'t match', () => {
      const test = testRoute(middleware({ repoName, webhookCallback, webhookSecret }));
      const req = {
        body: {
          secret: 'puppies',
        },
      };

      return test('post', '/webhook', req).then((res) => {
        expect(res.sendStatus).to.have.been.calledWith(401);
      });
    });

    it('returns 401 if no secret is sent', () => {
      const test = testRoute(middleware({ repoName, webhookCallback, webhookSecret }));
      const req = {};

      return test('post', '/webhook', req).then((res) => {
        expect(res.sendStatus).to.have.been.calledWith(401);
      });
    });

    it('returns 200 if the webhook callback runs', () => {
      const test = testRoute(middleware({ repoName, webhookCallback, webhookSecret }));
      const req = {
        body: {
          secret: webhookSecret,
        },
      };

      return test('post', '/webhook', req).then((res) => {
        expect(res.sendStatus).to.have.been.calledWith(200);
      });
    });

    it('returns 500 if the webhook callback fails', () => {
      const cb = () => Promise.reject();
      const test = testRoute(middleware({ repoName, webhookCallback: cb, webhookSecret }));
      const req = {
        body: {
          secret: webhookSecret,
        },
      };

      return test('post', '/webhook', req).then((res) => {
        expect(res.sendStatus).to.have.been.calledWith(500);
      });
    });
  });

  describe('/preview', () => {
    // Mock Express response
    let res;
    // Mock prismic API instance
    const api = {
      previewSession: sinon.stub().returns(previewUrl),
    };
    // Mock Express request
    const req = {
      query: {
        token: previewToken,
      },
    };

    before(async () => {
      const test = testRoute(middleware({ repoName, accessToken, linkResolver }));

      sinon.stub(Prismic, 'getApi').returns(api);
      res = await test('get', '/preview', req);
    });

    after(() => Prismic.getApi.restore());

    it('calls Prismic.getApi()', () => {
      expect(Prismic.getApi).to.have.been.calledWith(`https://${repoName}.prismic.io/api/v2`);
    });

    it('calls api.previewSession()', () => {
      expect(api.previewSession).to.have.been.calledWithExactly(req.query.token, linkResolver, '/');
    });

    it('sets a cookie', () => {
      expect(res.cookie).to.have.been.calledWith(Prismic.previewCookie, req.query.token);
    });

    it('returns a redirect', () => {
      expect(res.redirect).to.have.been.calledWithExactly(302, previewUrl);
    });
  });
});

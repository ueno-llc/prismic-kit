import { Router } from 'express';
import Prismic from 'prismic-javascript';
import dotProp from 'dot-prop';
import PrismicKit from '.';

export default function prismicMiddleware(config = {}) {
  const {
    webhookCallback = null,
    webhookSecret = null,
    linkResolver = () => '/',
  } = config;
  const router = Router();

  const { repoName, accessToken } = PrismicKit.config();

  if (!repoName) {
    throw new Error('PrismicKit.config() must be called before Express middleware can be used.');
  }

  // If there's a webhook callback, validate that it's a function
  if (webhookCallback !== null && typeof webhookCallback !== 'function') {
    throw new TypeError(`Expected Prismic webhook callback to be a function or null, but got ${typeof webhookCallback}`);
  }

  // If there's a webhook secret, validate that there's also a webhook function
  if (webhookSecret && typeof webhookCallback !== 'function') {
    throw new TypeError(`Expected webhookCallback to be passed along with webhookSecret, but webhookCallback is ${typeof webhookCallback}`);
  }

  if (webhookCallback) {
    /**
     * Endpoint to run a callback when a Prismic webhook is triggered.
     */
    router.post('/webhook', async (req, res) => {
      const secret = dotProp.get(req, 'body.secret', null);

      if (webhookSecret) {
        if (secret !== webhookSecret) {
          // Return Unauthorized if Prismic sent a secret that doens't match what the server was
          // expecting
          return res.sendStatus(401);
        }
      } else if (secret !== null) {
        // Return Bad Request if Prismic sent a secret when the server wasn't expecting one
        return res.sendStatus(400);
      }

      try {
        await webhookCallback();
        // Return OK if the webhook function executed successfully
        res.sendStatus(200);
      } catch (err) {
        // Return Internal Server Error if something went wrong
        res.sendStatus(500);
      }
    });
  }

  /**
   * Endpoint to display a Prismic preview.
   */
  router.get('/preview', async (req, res) => {
    const { token } = req.query;
    const api = await Prismic.getApi(`https://${repoName}.prismic.io/api/v2`, {
      accessToken,
      req,
    });
    const url = await api.previewSession(token, linkResolver, '/');

    res.cookie(Prismic.previewCookie, token, {
      maxAge: 30 * 60 * 1000,
      path: '/',
      httpOnly: false,
    });
    res.redirect(302, url);
  });

  return router;
}

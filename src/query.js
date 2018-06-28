import Prismic from 'prismic-javascript';

const PRISMIC_API = '__PRISMIC_API__';

export default function query(config = {}) {
  const { repoName, accessToken } = config;

  if (!repoName) {
    throw new TypeError('You must specify a Prismic repository.');
  }

  if (typeof repoName !== 'string') {
    throw new TypeError(`Expected Prismic repository name to be a string, but got ${typeof repoName}`);
  }

  if (accessToken && typeof accessToken !== 'string') {
    throw new TypeError(`Expected Prismic access token to be a string, but got ${typeof accessToken}`);
  }

  /**
   * Get a Prismic API instance.
   * @returns {Promise.<Object>} Promise containing Prismic API instance.
   * @private
   */
  async function getApi() {
    return Prismic.getApi(`https://${repoName}.prismic.io/api/v2`, {
      accessToken,
    });
  }

  /**
   * Create work function for react-jobs that has access to a Prismic API instance, and the props of
   * a component.
   * @param {PrismicFetchCallback} fn - Function that fetches from Prismic.
   * @returns {PrismicWorkFunction} Function to pass to react-jobs.
   */
  return function queryPrismic(fn) {
    if (typeof fn !== 'function') {
      throw new TypeError(`Expected a callback function to query Prismic, but got ${typeof fn}`);
    }

    /**
     * Function to pass to react-jobs.
     * @callback PrismicWorkFunction
     * @param {Object} props - Component props.
     * @returns {Promise.<*>} Promise containing job result.
     */
    return async (props) => {
      let api;

      if (typeof window === 'undefined') {
        // On the server, always get a new API ref
        api = await getApi();
      } else if (window[PRISMIC_API]) {
        // On the client, reuse the same API ref within a session
        api = window[PRISMIC_API];
      } else {
        window[PRISMIC_API] = await getApi();
        api = window[PRISMIC_API];
      }

      /**
       * Function that fetches from Prismic.
       * @callback PrismicFetchCallback
       * @param {Object} api - Prismic API wrapper.
       * @param {Object} props - Component props.
       * @returns {Promise.<*>} Promise containing job result.
       */
      return fn(api, props);
    };
  };
}

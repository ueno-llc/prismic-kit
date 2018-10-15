import Prismic from 'prismic-javascript';
import PrismicKit from '.';

/**
 * Create work function for react-jobs that has access to a Prismic API instance, and the props of
 * a component.
 * @param {PrismicFetchCallback} fn - Function that fetches from Prismic.
 * @returns {PrismicWorkFunction} Function to pass to react-jobs.
 */
export default function queryPrismic(fn) {
  if (typeof fn !== 'function') {
    throw new TypeError(`Expected a callback function to query Prismic, but got ${typeof fn}`);
  }

  const { repoName, accessToken } = PrismicKit.config();

  if (!repoName) {
    throw new Error('PrismicKit.config() must be called before the query function can be used.');
  }

  /**
   * Function to pass to react-jobs.
   * @callback PrismicWorkFunction
   * @param {Object} props - Component props.
   * @returns {Promise.<*>} Promise containing job result.
   */
  return async (props) => {
    const api = await Prismic.getApi(`https://${repoName}.prismic.io/api/v2`, {
      accessToken,
    });

    /**
     * Function that fetches from Prismic.
     * @callback PrismicFetchCallback
     * @param {Object} api - Prismic API wrapper.
     * @param {Object} props - Component props.
     * @returns {Promise.<*>} Promise containing job result.
     */
    return fn(api, props);
  };
}

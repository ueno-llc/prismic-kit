let config = {};

export default {
  config(opts = null) {
    if (opts === null) {
      return config;
    }

    // Validate that there's a Prismic repo
    if (!opts.repoName) {
      throw new TypeError('You must specify a Prismic repository.');
    }

    // Validate that the Prismic repo name is a string
    if (typeof opts.repoName !== 'string') {
      throw new TypeError(`Expected Prismic repository name to be a string, but got ${typeof opts.repoName}`);
    }

    // If there's an access token, validate that it's a string
    if (!['undefined', 'string'].includes(typeof opts.accessToken)) {
      throw new TypeError(`Expected Prismic access token to be a string, but got ${typeof opts.accessToken}`);
    }

    // Validate that the link resolver is a function
    if (typeof opts.linkResolver !== 'undefined') {
      throw new TypeError(`Expected Prismic link resolver to be a function, but got ${typeof opts.linkResolver}`);
    }

    config = opts;
  },
};

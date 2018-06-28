import sinon from 'sinon';

/**
 * Create a mock response object where each method is a spy.
 * @private
 */
const mockRes = () => ({
  sendStatus: sinon.spy(),
  cookie: sinon.spy(),
  redirect: sinon.spy(),
});

/**
 * Create a function that can test Express routes with mock requests and responses.
 * @param {Object} middleware - Express middleware;
 * @returns {MiddlewareTesterFunction} Middleware tester function.
 */
export default function testRoute(middleware) {
  /**
   * Test an Express route with a specific method and request object.
   * @callback MiddlewareTesterFunction
   * @param {String} method - Method to use.
   * @param {String} path - Path to test.
   * @param {Object} req - Mock request object.
   * @returns {Promise.<Object>} - Promise containing mock response object.
   */
  return async function test(method, path, req) {
    const res = mockRes();

    // Find a route that matches the given path and method
    const route = middleware.stack.find(item =>
      item.route.methods[method.toLowerCase()] && item.regexp.test(path));

    // Run the route handler and return the response
    if (route) {
      await route.handle({ ...req, method }, res);
      return res;
    }

    // If no response was found, set the response to 404
    res.sendStatus(404);
    return res;
  };
}

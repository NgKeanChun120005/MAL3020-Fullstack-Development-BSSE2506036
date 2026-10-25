const { expect } = require('chai');
const sinon = require('sinon');
const { roleGuard } = require('../src/middleware/roleGuard');

//This is a unit test suite for the roleGuard middleware function, which checks if a user has the required role to access a route.
// The tests use Mocha as the test framework and Chai for assertions, along with Sinon for creating spies and mocks.

describe('roleGuard (unit)', () => {
  // Helper function to create mock req, res, and next objects
  function mockReqRes(role) {
    return {
      req: { user: role ? { role } : undefined },
      res: {},
      next: sinon.spy()
    };
  }

  //test case for allowing a user whose role is permitted
    it('allows a user whose role is permitted', () => {
    const guard = roleGuard('admin', 'kitchen');
    // Create a mock request with a user role 'admin'
    const { req, res, next } = mockReqRes('admin');

    // Call the roleGuard middleware with the mock request, response, and next function
    guard(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args).to.be.empty;
  });


  //test case for rejecting a user whose role is not permitted
  it('rejects a user whose role is not permitted', () => {
    const guard = roleGuard('admin');
    // Create a mock request with a user role 'customer'
    const { req, res, next } = mockReqRes('customer');

    guard(req, res, next);

    expect(next.calledOnce).to.be.true;
    const err = next.firstCall.args[0];
    expect(err).to.have.property('status', 403);
    expect(err.message).to.equal('Forbidden');
  });

  //test case for rejecting an unauthenticated request
  it('rejects an unauthenticated request', () => {
    const guard = roleGuard('admin');
    // Create a mock request without an authenticated user
    const { req, res, next } = mockReqRes(undefined);

    guard(req, res, next);

    const err = next.firstCall.args[0];
    expect(err).to.have.property('status', 401);
    expect(err.message).to.equal('Not authenticated');
  });
  

  it('permits any of multiple allowed roles', () => {
    const guard = roleGuard('kitchen', 'admin');
    // Create a mock request with a user role 'kitchen'
    const { req, res, next } = mockReqRes('kitchen');

    guard(req, res, next);

    expect(next.firstCall.args).to.be.empty;
  });
});
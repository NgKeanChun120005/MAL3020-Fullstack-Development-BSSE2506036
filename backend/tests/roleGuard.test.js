const { expect } = require('chai');
const sinon = require('sinon');
const { roleGuard } = require('../src/middleware/roleGuard');

describe('roleGuard (unit)', () => {
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
    const { req, res, next } = mockReqRes('admin');

    guard(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(next.firstCall.args).to.be.empty;
  });


  //test case for rejecting a user whose role is not permitted
  it('rejects a user whose role is not permitted', () => {
    const guard = roleGuard('admin');
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
    const { req, res, next } = mockReqRes(undefined);

    guard(req, res, next);

    const err = next.firstCall.args[0];
    expect(err).to.have.property('status', 401);
    expect(err.message).to.equal('Not authenticated');
  });
  

  it('permits any of multiple allowed roles', () => {
    const guard = roleGuard('kitchen', 'admin');
    const { req, res, next } = mockReqRes('kitchen');

    guard(req, res, next);

    expect(next.firstCall.args).to.be.empty;
  });
});
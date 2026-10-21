import { jest } from '@jest/globals';
import { roleGuard } from '../src/middleware/roleGuard.js';

describe('roleGuard', () => {
  function mockReqRes(role) {
    const req = { user: role ? { role } : undefined };
    const res = {};
    const next = jest.fn();
    return { req, res, next };
  }

  //test case for allowing a user whose role is permitted
  it('allows a user whose role is permitted', () => {
    const guard = roleGuard('admin', 'kitchen');
    const { req, res, next } = mockReqRes('admin');
    guard(req, res, next);

    expect(next).toHaveBeenCalledWith();   // called with no args = success
  });

  //test case for rejecting a user whose role is not permitted
  it('rejects a user whose role is not permitted', () => {
    const guard = roleGuard('admin');
    const { req, res, next } = mockReqRes('customer');
    guard(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 403,
      message: 'Forbidden'
    }));
  });

  //test case for rejecting an unauthenticated request
  it('rejects an unauthenticated request', () => {
    const guard = roleGuard('admin');
    const { req, res, next } = mockReqRes(undefined);
    guard(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      status: 401,
      message: 'Not authenticated'
    }));
  });

  //test case for permitting any of multiple allowed roles
  it('permits any of multiple allowed roles', () => {
    const guard = roleGuard('kitchen', 'admin');
    const { req, res, next } = mockReqRes('kitchen');
    guard(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
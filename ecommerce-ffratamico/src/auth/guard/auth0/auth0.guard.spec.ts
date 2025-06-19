import { Auth0Guard } from './auth0.guard';

describe('Auth0Guard', () => {
  it('should be defined', () => {
    expect(new Auth0Guard()).toBeDefined();
  });
});

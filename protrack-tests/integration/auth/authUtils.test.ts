import { parseAuthParams } from '../../../protrack-mobile/src/utils/authUtils';

describe('parseAuthParams', () => {
  it('correctly parses hash fragments', () => {
    const url = 'protrack://auth/callback#access_token=tok123&refresh_token=ref456&type=signup';
    const params = parseAuthParams(url);
    expect(params).toEqual({
      access_token: 'tok123',
      refresh_token: 'ref456',
      type: 'signup',
    });
  });

  it('correctly parses query parameters', () => {
    const url = 'protrack://reset-password?access_token=tok789&refresh_token=ref101&type=recovery';
    const params = parseAuthParams(url);
    expect(params).toEqual({
      access_token: 'tok789',
      refresh_token: 'ref101',
      type: 'recovery',
    });
  });

  it('handles mixed query parameters and hash fragments correctly', () => {
    const url = 'protrack://reset-password?something=else#access_token=tok_abc&refresh_token=tok_xyz&type=recovery';
    const params = parseAuthParams(url);
    expect(params).toEqual({
      something: 'else',
      access_token: 'tok_abc',
      refresh_token: 'tok_xyz',
      type: 'recovery',
    });
  });

  it('returns empty object when no parameters are present', () => {
    const url = 'protrack://home';
    const params = parseAuthParams(url);
    expect(params).toEqual({});
  });

  it('handles URL-decoded values correctly', () => {
    const url = 'protrack://auth/callback?email=test%40protrack.com&name=John%20Doe';
    const params = parseAuthParams(url);
    expect(params).toEqual({
      email: 'test@protrack.com',
      name: 'John Doe',
    });
  });
});

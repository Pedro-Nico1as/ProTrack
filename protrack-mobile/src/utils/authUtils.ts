/**
 * Parses parameters from an incoming deep link URL.
 * Supports both query parameters (?key=value) and hash fragments (#key=value).
 */
export const parseAuthParams = (url: string): { [key: string]: string } => {
  const params: { [key: string]: string } = {};
  const regex = /[?#&]([^=#&]+)=([^&#]*)/g;
  let match;
  while ((match = regex.exec(url)) !== null) {
    params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
  }
  return params;
};

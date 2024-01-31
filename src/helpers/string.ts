import crypto from 'crypto';

const patternNotAlphaNumeric: RegExp = /[^a-zA-Z0-9]/g;
const patternNotEmail: RegExp = /[^a-zA-Z0-9@.]/g;
const patternNonJson: RegExp = /[^\w\d\s\[\]{}\\:",\-]/g;
const patternNonSignature: RegExp = /[^a-zA-Z0-9_\-]/g;

export const cleanupAlphaNumeric = (str: string): string => {
  return str.replace(patternNotAlphaNumeric, '');
};

export const cleanUpEmail = (email: string): string => {
  return email.replace(patternNotEmail, '');
};

export const cleanUpbase64Json = (base64Json: string): string => {
  const str = Buffer.from(base64Json, 'base64').toString('utf-8').replace(patternNonJson, '');
  return Buffer.from(str).toString('base64');
};

export const cleanUpbase64str = (base64Json: string): string => {
  const str = Buffer.from(base64Json, 'base64').toString('utf-8').replace(patternNotAlphaNumeric, '');
  return Buffer.from(str).toString('base64');
};

export const cleanUpSignature = (signature: string): string => {
  return signature.replace(patternNonSignature, '');
};

export const cleanupJWT = (jwt: string): string => {
  const parts = jwt.split('.');
  const [header, paddedPayload] = [parts[0], parts[1]].map((x) => cleanUpbase64Json(x));
  const payload = paddedPayload.replace(/=/g, '');
  const signature = cleanUpSignature(parts[2]);
  return `${header}.${payload}.${signature}`;
};

export const generateRandomUrlSafeString = (length: number): string => {
  return crypto.randomBytes(length).toString('base64').replace(patternNotAlphaNumeric, '');
};

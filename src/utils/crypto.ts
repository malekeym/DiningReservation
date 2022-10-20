import { INITIALIZATION_VECTOR, SECRET_SALT } from '@/config';
import crypto from 'crypto';

const algorithm = 'aes-256-ctr';
const secretKey = SECRET_SALT;
const iv = INITIALIZATION_VECTOR;

const encrypt = (text: string): string => {

  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return encrypted.toString('hex');
};

const decrypt = (hash: string): string => {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

  const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);

  return decrpyted.toString();
};

export {
  encrypt,
  decrypt,
};

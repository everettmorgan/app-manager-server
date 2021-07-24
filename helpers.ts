import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { promisify } from 'util';
import redis from './db/redis';
import { Request, Response, NextFunction } from 'express';

export function respond(res: Response, status: number, message?: any) {
  res.status(status).json({
    status: status,
    message: message ?? '',
  })
}

export function base64Encode(str) {
  return Buffer.from(str).toString('base64');
}

export function base64Decode(str) {
  return Buffer.from(str, 'base64').toString('utf8');
}

export function hasOwnMany(body: { [key: string]: any }, props: Array<string>) {
  return !props.filter((prop) => !Object.prototype.hasOwnProperty.call(body, prop)).length;
}

export function isDuda(req: Request, res: Response, next: NextFunction) {
  const body = JSON.stringify(req.body);
  const secret = process.env.DUDA_WB_SECRET;
  const { 'x-duda-signature': sig, 'x-duda-signature-timestamp': time } = req.headers;

  const check = crypto.createHmac("sha256", base64Encode(secret))
    .update(`${time}.${body}`)
    .digest("base64");

  (sig !== check) ? res.status(400).send() : next();
}

export function protect(req: Request, res: Response, next: NextFunction) {
  if (!req.cookies.amjwt || !req.cookies.amjwts) {
    return respond(res, 400, 'Unauthorized');
  }

  try {
    jwt.verify(req.cookies.amjwt + '.' + req.cookies.amjwts, process.env.JWT_SECRET);
    next();
  } catch (e) {
    respond(res, 400, 'Unauthorized');
  }
}

export function encrypt(data: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes256', process.env.CIPHER_SECRET, iv);
  const encrypted = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
  return encrypted + ':' + iv.toString('hex');
}

export function decrypt(data: string, iv: string) {
  const cipher = crypto.createDecipheriv('aes256', process.env.CIPHER_SECRET, Buffer.from(iv, 'hex'));
  const decrypt = cipher.update(data, 'hex', 'utf8') + cipher.final('utf8');
  return decrypt;
}

export function createJWT(payload: { [key: string]: any }, aid: string) {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: 1800000,
    issuer: 'App Manager',
    audience: aid,
  })

  return token.split('.');
}

export function decodeJWT(token: string) {
  return jwt.decode(token) as jwt.JwtPayload;
}

export async function getToken(aid: string) {
  const get = promisify(redis.get).bind(redis);
  const encrypted = await get(`${aid}:token`);
  const [tok, iv] = encrypted.split(':');
  const token = decrypt(tok, iv);
  return token;
}
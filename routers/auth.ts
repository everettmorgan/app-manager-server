import redis from '../db/redis';
import { promisify } from 'util';
import { ping } from '../api/api';
import { Router, Request, Response } from 'express';
import { respond, protect, encrypt, createJWT } from '../helpers';

const auth = Router();

auth.get('/check', protect, (req: Request, res: Response) => respond(res, 200, 'OK'));

auth.post('/login', async function (req: Request, res: Response) {
  const user = req.body.user;
  const pass = req.body.pass;
  const aid = req.body.aid;

  const token = Buffer.from(`${user}:${pass}`).toString('base64');
  const encrypted = encrypt(token);
  const set = promisify(redis.set).bind(redis);
  const sadd = promisify(redis.sadd).bind(redis);

  try {
    await ping(token);
    await set(`${aid}:token`, encrypted);
  } catch (err) {
    console.log(err);
  }

  const [h, p, s] = createJWT({ aid }, aid);
  res.cookie('amjwt', `${h}.${p}`, { secure: true, sameSite: 'none' });
  res.cookie('amjwts', s, { secure: true, httpOnly: true, sameSite: 'none' });
  respond(res, 200, 'OK');
});


export default auth;
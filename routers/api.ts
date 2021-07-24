import redis from '../db/redis';
import { Router, Request, Response } from 'express';
import { respond, protect, getToken, decodeJWT } from '../helpers';
import { getManifest } from '../api/api';
import { promisify } from 'util';

const api = Router();

api.get('/apps', protect, async function (req: Request, res: Response) {
  const details = decodeJWT(`${req.cookies.amjwt}.${req.cookies.amjwts}`);
  const smembers = promisify(redis.smembers).bind(redis);

  try {
    const apps = await smembers(`${details.aid}:apps`);
    const token = await getToken(details.aid);
    const manifests = await Promise.all(
      apps.map((app) => getManifest(app, token))
    );
    respond(res, 200, manifests);
  } catch (err) {
    console.log(err);
    respond(res, 500, 'Internal server error.');
  }
});

api.post('/apps', protect, async function (req: Request, res: Response) {
  const uuid = req.body.uuid;
  const details = decodeJWT(`${req.cookies.amjwt}.${req.cookies.amjwts}`);
  const sadd = promisify(redis.sadd).bind(redis);

  try {
    await sadd(`${details.aid}:apps`, uuid);
    respond(res, 200, 'OK');
  } catch (err) {
    console.log(err);
    respond(res, 500, 'Internal server error.');
  }
});

api.delete('/apps', protect, async function (req: Request, res: Response) {
  const uuid = req.body.uuid;
  const details = decodeJWT(`${req.cookies.amjwt}.${req.cookies.amjwts}`);
  const srem = promisify(redis.srem).bind(redis);

  try {
    await srem(`${details.aid}:apps`, uuid);
    respond(res, 200, 'OK');
  } catch (err) {
    console.log(err);
    respond(res, 500, 'Internal server error.');
  }
});

export default api;
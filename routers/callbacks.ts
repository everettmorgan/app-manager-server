import redis from '../db/redis';
import { Router, Request, Response, response } from 'express';
import { hasOwnMany, respond } from '../helpers';

import { getManifest } from '../api/api';

const callbacks = Router();

callbacks.post('/install', function (req: Request, res: Response) {
  const body = req.body;
  redis.hmset(body.account_owner_uuid,
    "endpoint", body.api_endpoint,
    "plan", body.app_plan_uuid,
    "recurrency", body.recurrency ?? "MONTHLY",
    "token.auth", body.auth.authorization_code,
    "token.refresh", body.auth.refresh_token,
    "token.exp", body.auth.expiration_date,
    "free", body.free, function (err, reply) {
      console.log(err, reply);
      if (err) {
        respond(res, 500, err.toString());
      } else {
        respond(res, 200, reply);
      }
    });
});

callbacks.post('/uninstall', function (req: Request, res: Response) {
  const body = req.body;
});

export default callbacks;
require('dotenv').config();

import * as express from 'express';
import * as cookieParser from 'cookie-parser';

import api from './routers/api';
import auth from './routers/auth';
import callbacks from './routers/callbacks';

const app = express();
const cors = require('cors');

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use('/api', api);
app.use('/auth', auth);
app.use('/callback', callbacks);

app.post('/webhooks', function (req, res) {
  console.log(req.body);
});

app.listen(8082, function () {
  console.log('server started');
});
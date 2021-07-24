import * as https from 'https';

export function getManifest(uuid: string, token: string) {
  return API('/' + uuid, token);
}

export function ping(token: string) {
  return API('/health', token);
}

type HTTPMethod = "GET" | "PUT" | "POST" | "DELETE";

function API(
  endpoint: string,
  token: string,
  method?: HTTPMethod,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const request = https.request({
      method: method ? method : "GET",
      host: 'api-sandbox.duda.co',
      path: '/api/integrationhub/application' + endpoint,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${token}`,
      }
    }, function (response) {
      let data = [];
      let length = 0;

      response.on('data', function (d) {
        data.push(d);
        length += d.length;
      })

      response.on('end', function () {
        let buf = Buffer.alloc(length);
        for (let i = 0, pos = 0; i < data.length; i++) {
          data[i].copy(buf, pos);
          pos += data[i].length;
        }

        resolve(handleResponse(response, data));
      })
    })

    request.end();
  })
}

function handleResponse(res, buf) {
  switch (res.headers['content-type']) {
    case 'application/json':
      return JSON.parse(buf.toString('utf-8'));
    default:
      return buf.toString('utf-8');
  }
}
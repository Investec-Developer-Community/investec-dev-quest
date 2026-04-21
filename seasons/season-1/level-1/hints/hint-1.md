# Hint 1 — Authentication

The Investec API uses **OAuth 2.0 Client Credentials** grant type.

You need to send a `POST` request with `application/x-www-form-urlencoded` body and auth headers:

```
grant_type=client_credentials
Authorization: Basic <base64(clientId:clientSecret)>
x-api-key: <your_api_key>
```

In JavaScript, `URLSearchParams` is the cleanest way to build that body:

```js
const body = new URLSearchParams({
  grant_type: 'client_credentials',
})

const res = await fetch(`${BASE_URL}/identity/v2/oauth2/token`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    'x-api-key': apiKey,
  },
  body: body.toString(),
})
```

Check the response status code. If it's not `2xx`, throw an error.

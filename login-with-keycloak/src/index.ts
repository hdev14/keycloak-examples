import { auth, ConfigParams } from 'express-openid-connect';
import express, { Request, Response } from 'express';
import keycloak, { memoryStore } from './keycloak';
import session from 'express-session';

const app = express();

app.use(express.json());


app.use(auth({
  authRequired: false,
  auth0Logout: true,
  baseURL: 'http://localhost:3000',
  clientID: 'login',
  issuerBaseURL: 'http://localhost:8080/realms/kc_login',
  secret: 'suCvEiA1eMPCoxm7C1goOBsH1XZkD7le', 
  authorizationParams: {
    response_type: 'code'
  }
}));

app.get('/', (req, res) => {
  // @ts-ignore
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out')
});

// app.use(session({
//   secret: '0987654321',
//   store: memoryStore,
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     maxAge: 1000 * 60 * 5,
//   }
// }));


// app.use(keycloak.middleware({
//   logout: '/logout',
//   admin: '/',
// }));


// app.get('/', keycloak.protect(), (request, response) => {
//   // @ts-ignore
//   console.log(request.kauth.grant);
//   response.status(200).json({ message: 'Hello World ' });
// });

// app.get('/private', keycloak.protect(''), (request, response) => {
//   // @ts-ignore
//   console.log(request.kauth.grant);
//   response.status(200).json({ message: 'Hello World ' });
// });

app.listen(3000, () => {
  console.log('Server is running. http://localhost:3000');
});
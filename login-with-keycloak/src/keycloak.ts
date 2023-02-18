import KeycloakConnect from "keycloak-connect";
import session from 'express-session';

export const memoryStore = new session.MemoryStore();

const keycloak = new KeycloakConnect({
  store: memoryStore,
}, {
  realm: "kc_login",
  "auth-server-url": "http://localhost:8080/",
  "ssl-required": "external",
  resource: "login",
  "confidential-port": 0,
});

export default keycloak;
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  idToken: string;
};

export type TokenPayload = {
  exp: number;
  iat: number;
  auth_time: number;
  jti: string;
  iss: string;
  aud: string[];
  sub: string;
  typ: string;
  azp: string;
  session_state: string;
  acr: string;
  'allowed-origins': string[];
  realm_access: {
    roles: string[];
  };
  resource_access: Record<string, { roles: string[] }>;
  scope: string;
  sid: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
};

export default async function authorized(request: Request, response: Response, next: NextFunction) {
  if (request.isAuthenticated()) {
    const session: any = request.session;
    const user = request.user as AuthUser;

    if (!session.roles) {
      const payload = <TokenPayload>jwt.verify(user.accessToken, process.env.KC_CLIENT_PUBLIC_KEY!);

      const applicationKeys = Object.keys(payload.resource_access);

      const fullApplicationRoles = applicationKeys.map((key) => {
        return payload.resource_access[key].roles;
      }).reduce((acc, roles) => {
        return [...acc, ...roles];
      }, []);

      const roles = [
        ...payload.realm_access.roles,
        ...fullApplicationRoles,
      ];

      session.roles = roles;
      request.session = session;
    }

    return next();
  }

  return response.redirect('/login');
}

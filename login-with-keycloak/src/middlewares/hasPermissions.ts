import { NextFunction, Request, Response } from "express";

export type Spec = {
  and?: string[]
  or?: string[]
}

export default function hasPermissions(spec: Spec | string) {
  return (request: Request, response: Response, next: NextFunction) => {
    const session: any = request.session;

    if (session.roles) {
      if (typeof spec === 'string' && session.roles.includes(spec)) {
        return next();
      }

      if (typeof spec === 'object' && containsRoles(spec, session.roles)) {
        return next();
      }
    }

    return response.render('403');
  }
}

function containsRoles(spec: Spec, roles: string[]) {
  let containsAllRoles = true;
  let containsSomeRoles = true;

  const isASimpleOperation = (spec.and && spec.or && spec.and.length > 0 && spec.or.length === 1);

  if (isASimpleOperation) {
    throw new Error('Use just "and" instead.');
  }

  if (spec.and) {
    containsAllRoles = spec.and.every((role) => roles.includes(role));
  }

  if (spec.or) {
    containsSomeRoles = spec.or.some((role) => roles.includes(role));
  }

  return containsAllRoles && containsSomeRoles;
}

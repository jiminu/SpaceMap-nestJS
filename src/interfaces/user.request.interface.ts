import Request from 'express';

export interface UserRequestInterface extends Request {
  user: any;
  passport: any;
  cookies: any;
}

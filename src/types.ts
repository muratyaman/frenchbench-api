import { IFactory } from './factory';
import { ISessionUser } from './lib';

export interface IContext {
  user?: ISessionUser;
  f: IFactory;
}


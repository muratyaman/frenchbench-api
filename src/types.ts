import { IFactory } from './factory';
import { SessionUser } from './lib';

export interface IContext {
  user?: SessionUser;
  f: IFactory;
}

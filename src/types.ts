import { IFactory } from './factory';
import { SessionUser } from './lib';

export interface IContext {
  f: IFactory;
  user?: SessionUser;
  tokenError?: string | null;
}

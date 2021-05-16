import { IFactory } from './factory';
import { SessionUser } from './fblib';

export interface IContext {
  f: IFactory;
  user?: SessionUser;
  tokenError?: string | null;
}

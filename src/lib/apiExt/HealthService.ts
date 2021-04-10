import { ts } from '../utils';

export class HealthService {
  async health() {
    return Promise.resolve({ data: ts(), error: null });
  }
}

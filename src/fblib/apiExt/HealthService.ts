import { ts } from '../utils';

export class HealthService {
  async health() {
    return Promise.resolve({ data: ts(), error: null });
  }
  _api() {
    return {
      health: this,
    };
  }
}

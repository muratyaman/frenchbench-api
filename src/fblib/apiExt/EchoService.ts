export class EchoService {
  async echo({ input }) {
    return Promise.resolve({ data: input, error: null });
  }
  _api() {
    return {
      echo: this,
    };
  }
}

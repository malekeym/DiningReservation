import { REDIS_URL } from '@/config';
import { Client, Repository, Schema } from 'redis-om';

class AuthRepository {
  public client: Client;

  constructor() {
    this.init();
  }
  private async init() {
    this.client = await new Client().open(REDIS_URL);
  }
}

export default AuthRepository;

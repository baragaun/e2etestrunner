import { randomUUID, RandomUUIDOptions } from 'node:crypto';

export class Uuid {
  public v4(options?: RandomUUIDOptions | undefined): string {
    return randomUUID(options);
  }
}
export default new Uuid();

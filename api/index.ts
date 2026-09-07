import { createApp } from '../server/app';

let appPromise: any = null;

export default async function handler(req: any, res: any) {
  if (!appPromise) {
    appPromise = createApp();
  }
  const app = await appPromise;
  return app(req, res);
}

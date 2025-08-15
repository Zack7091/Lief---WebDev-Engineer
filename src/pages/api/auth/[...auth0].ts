import { NextApiRequest, NextApiResponse } from 'next';
import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export default handleAuth({
  async login(req: NextApiRequest, res: NextApiResponse) {
    try {
      await handleLogin(req, res, {
        returnTo: '/clock-in', // Login ke baad redirect yaha karega
      });
    } catch (error: any) {
      res.status(error.status || 500).end(error.message);
    }
  },
});

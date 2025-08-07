import { neoApi } from './neoApi';

export const authAPI = {
  register: (data: any) => neoApi.post('/api/v1/auth/register', data),
  resendCode: (email: string) => neoApi.post('/api/v1/auth/resend-code', { email }),
  verify: (email: string, code: string) => neoApi.post('/api/v1/auth/verify', { email, code }),
  checkVerification: (email: string) => neoApi.post('/api/v1/auth/check-verification', { email }),
  login: (email: string, password: string) => neoApi.post('/api/v1/auth/login', { email, password }),
  deleteAccount: () => neoApi.delete('/api/v1/auth/profile'),
};

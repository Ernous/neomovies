import { neoApi } from './neoApi';

export const authAPI = {
  register: (data: any) => {
    return neoApi.post('/api/v1/auth/register', data);
  },
  resendCode: (email: string) => {
    return neoApi.post('/api/v1/auth/resend-code', { email });
  },
  verify: (email: string, code: string) => {
    return neoApi.post('/api/v1/auth/verify', { email, code });
  },
  checkVerification: (email: string) => {
    return neoApi.post('/api/v1/auth/check-verification', { email });
  },
  login: (email: string, password: string) => {
    return neoApi.post('/api/v1/auth/login', { email, password });
  },
  deleteAccount: () => {
    return neoApi.delete('/api/v1/auth/profile');
  }
};

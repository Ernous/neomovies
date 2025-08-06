import { neoApi } from './neoApi';

export const authAPI = {
  register: (data: any) => {
    return neoApi.post('/auth/register', data);
  },
  resendCode: (email: string) => {
    return neoApi.post('/auth/resend-code', { email });
  },
  verify: (email: string, code: string) => {
    return neoApi.post('/auth/verify', { email, code });
  },
  login: (email: string, password: string) => {
    return neoApi.post('/auth/login', { email, password });
  },
  deleteAccount: () => {
    return neoApi.delete('/auth/profile');
  }
};

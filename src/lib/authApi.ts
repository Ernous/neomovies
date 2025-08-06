import { neoApi } from './neoApi';

export const authAPI = {
  register(data: { email: string; password: string; name?: string }) {
    return neoApi.post('/api/v1/auth/register', data);
  },
  resendCode(email: string) {
    return neoApi.post('/api/v1/auth/resend-code', { email });
  },
  verify(email: string, code: string) {
    return neoApi.post('/api/v1/auth/verify', { email, code });
  },
  login(email: string, password: string) {
    return neoApi.post('/api/v1/auth/login', { email, password });
  },
  deleteAccount() {
    return neoApi.delete('/api/v1/auth/profile');
  }
};

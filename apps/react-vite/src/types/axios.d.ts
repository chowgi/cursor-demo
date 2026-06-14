import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipErrorNotification?: boolean;
  }
}

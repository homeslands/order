// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios, { InternalAxiosRequestConfig } from 'axios'

// Augment the Axios module to add doNotShowLoading to InternalAxiosRequestConfig
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    doNotShowLoading?: boolean
  }
}

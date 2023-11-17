import axios, { AxiosInstance } from 'axios';
import { HttpAdapter } from '../interfaces/http-adapter.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AxiosAdapter implements HttpAdapter {
  private axios: AxiosInstance = axios;

  async get<T>(url: string, config?: any): Promise<T> {
    try {
      const { data } = await this.axios.get<T>(url, config);
      return data;
    } catch (error) {
      throw new Error(
        `This is an error - Check logs. -> ${JSON.stringify(error)}`,
      );
    }
  }
  post<T>(url: string, data: any, config?: any): Promise<T> {
    throw new Error('Method not implemented.' + url);
  }
  put<T>(url: string, data: any, config?: any): Promise<T> {
    throw new Error('Method not implemented.' + url);
  }
  delete<T>(url: string, config?: any): Promise<T> {
    throw new Error('Method not implemented.' + url);
  }
}

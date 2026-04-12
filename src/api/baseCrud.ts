// src/api/baseCrud.ts
import api from './client';

export interface Paginated<T> {
  data: T;
  total: number;
  page: number;
  pageSize: number;
}

export interface Answer {
  message: string;
  data?: any;
}

export const createCrudService = <T>(basePath: string) => {
  return {
    getAll: async (page: number = 1, pageSize: number = 10): Promise<Paginated<T[]>> => {
      const response = await api.get(basePath, { params: { page, pageSize } });
      return response.data;
    },
    getById: async (id: string | number): Promise<T> => {
      const response = await api.get(`${basePath}/${id}`);
      return response.data;
    },
    create: async (data: Partial<T>): Promise<Answer> => {
      const response = await api.post(basePath, data);
      return response.data;
    },
    update: async (id: string | number, data: Partial<T>): Promise<Answer> => {
      const response = await api.put(`${basePath}/${id}`, data);
      return response.data;
    },
    delete: async (id: string | number): Promise<Answer> => {
      const response = await api.delete(`${basePath}/${id}`);
      return response.data;
    }
  };
};
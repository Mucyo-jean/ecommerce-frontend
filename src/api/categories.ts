import { api } from '../lib/api';
import type { ApiResponse, Category } from '../types';

export async function listCategories() {
  const res = await api.get<ApiResponse<Category[]>>('/categories');
  return res.data.data;
}

export async function getCategory(id: string) {
  const res = await api.get<ApiResponse<Category>>(`/categories/${id}`);
  return res.data.data;
}

export interface CategoryPayload {
  name: string;
  description?: string;
  imageUrl?: string;
}

export async function createCategory(payload: CategoryPayload) {
  const res = await api.post<ApiResponse<Category>>('/categories', payload);
  return res.data.data;
}

export async function updateCategory(id: string, payload: Partial<CategoryPayload>) {
  const res = await api.put<ApiResponse<Category>>(`/categories/${id}`, payload);
  return res.data.data;
}

export async function deleteCategory(id: string) {
  await api.delete(`/categories/${id}`);
}

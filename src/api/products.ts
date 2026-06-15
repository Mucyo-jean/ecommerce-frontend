import { api } from '../lib/api';
import type { ApiListResponse, ApiResponse, Product } from '../types';

export interface ListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
}

export async function listProducts(params: ListProductsParams = {}) {
  const res = await api.get<ApiListResponse<Product>>('/products', { params });
  return res.data;
}

export async function getProduct(id: string) {
  const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
  return res.data.data;
}

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  stock?: number;
  categoryId: string;
  imageUrl?: string;
  currency?: string;
  isActive?: boolean;
}

export async function createProduct(payload: ProductPayload) {
  const res = await api.post<ApiResponse<Product>>('/products', payload);
  return res.data.data;
}

export async function updateProduct(id: string, payload: Partial<ProductPayload>) {
  const res = await api.put<ApiResponse<Product>>(`/products/${id}`, payload);
  return res.data.data;
}

export async function deleteProduct(id: string) {
  await api.delete(`/products/${id}`);
}

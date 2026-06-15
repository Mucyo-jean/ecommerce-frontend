import { api } from '../lib/api';
import type { ApiResponse, Cart } from '../types';

export async function getCart() {
  const res = await api.get<ApiResponse<Cart>>('/cart');
  return res.data.data;
}

export async function addItem(productId: string, quantity = 1) {
  const res = await api.post<ApiResponse<Cart>>('/cart/items', { productId, quantity });
  return res.data.data;
}

export async function updateItem(productId: string, quantity: number) {
  const res = await api.put<ApiResponse<Cart>>(`/cart/items/${productId}`, { quantity });
  return res.data.data;
}

export async function removeItem(productId: string) {
  const res = await api.delete<ApiResponse<Cart>>(`/cart/items/${productId}`);
  return res.data.data;
}

export async function clearCart() {
  const res = await api.delete<ApiResponse<Cart>>('/cart');
  return res.data.data;
}

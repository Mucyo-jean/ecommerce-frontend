import { api } from '../lib/api';
import type { ApiListResponse, ApiResponse, CheckoutInput, Order, OrderStatus } from '../types';

export async function checkout(payload: CheckoutInput) {
  const res = await api.post<ApiResponse<Order>>('/orders/checkout', payload);
  return res.data.data;
}

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export async function myOrders(params: ListOrdersParams = {}) {
  const res = await api.get<ApiListResponse<Order>>('/orders/my', { params });
  return res.data;
}

export async function allOrders(params: ListOrdersParams = {}) {
  const res = await api.get<ApiListResponse<Order>>('/orders', { params });
  return res.data;
}

export async function getOrder(id: string) {
  const res = await api.get<ApiResponse<Order>>(`/orders/${id}`);
  return res.data.data;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const res = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
  return res.data.data;
}

import { api } from '../lib/api';
import type { ApiResponse, DashboardData, SalesPoint, TopProduct } from '../types';

export async function getDashboard() {
  const res = await api.get<ApiResponse<DashboardData>>('/analytics/dashboard');
  return res.data.data;
}

export async function getSales(days = 14) {
  const res = await api.get<ApiResponse<SalesPoint[]>>('/analytics/sales', { params: { days } });
  return res.data.data;
}

export async function getTopProducts() {
  const res = await api.get<ApiResponse<TopProduct[]>>('/analytics/top-products');
  return res.data.data;
}

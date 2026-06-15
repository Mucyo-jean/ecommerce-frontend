import { api } from '../lib/api';
import type { RecommendationResponse } from '../types';

export async function trending() {
  const res = await api.get<RecommendationResponse>('/recommendations/trending');
  return res.data.data;
}

export async function alsoViewed(productId: string) {
  const res = await api.get<RecommendationResponse>(`/recommendations/also-viewed/${productId}`);
  return res.data.data;
}

export async function related(productId: string) {
  const res = await api.get<RecommendationResponse>(`/recommendations/related/${productId}`);
  return res.data.data;
}

export async function forYou() {
  const res = await api.get<RecommendationResponse>('/recommendations/for-you');
  return res.data.data;
}

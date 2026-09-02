import api from './axios';
import type { Item } from '@/types/item';

export async function getItems(): Promise<Item[]> {
  const response = await api.get('/items');

  return response.data.data;
}

export async function getItem(id: number): Promise<Item> {
  const response = await api.get(`/items/${id}`);

  return response.data.data;
}

export async function createItem(
  data: Partial<Item>
): Promise<Item> {
  const response = await api.post('/items', data);

  return response.data.data;
}

export async function updateItem(
  id: number,
  data: Partial<Item>
): Promise<Item> {
  const response = await api.put(`/items/${id}`, data);

  return response.data.data;
}

export async function deleteItem(id: number): Promise<void> {
  await api.delete(`/items/${id}`);
}

export async function getItemHistory(id: number) {
  const response = await api.get(`/items/${id}/history`);

  return response.data.data;
}

export const toggleItemBorrowable = async (itemId: number) => {
  const response = await api.post(
    `/items/${itemId}/make-borrowable`
  );

  return response.data;
};


export const discoverItems = async () => {
  const response = await api.get('/items/discover');

  return response.data.data;
};
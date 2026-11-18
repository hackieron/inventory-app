import api from './axios';
import type { BorrowingRequest } from '@/types/borrowing';

export const requestBorrowing = async (
  itemId: number,
  data: Pick<BorrowingRequest, 'expected_return_at' | 'notes'>
) => {
  const response = await api.post(
    `/items/${itemId}/borrowing-request`,
    data
  );

  return response.data as { message: string; data: BorrowingRequest };
};

export async function getMyBorrowingRequests(): Promise<BorrowingRequest[]> {
  const response = await api.get('/borrowing-requests/my');
  return response.data.data;
}

export async function getIncomingBorrowingRequests(): Promise<BorrowingRequest[]> {
  const response = await api.get('/borrowing-requests/incoming');
  return response.data.data;
}

async function updateRequest(id: number, action: 'approve' | 'reject' | 'cancel') {
  const response = await api.post(`/borrowing-requests/${id}/${action}`);
  return response.data as { message: string; data?: BorrowingRequest };
}

export const approveBorrowingRequest = (id: number) => updateRequest(id, 'approve');
export const rejectBorrowingRequest = (id: number) => updateRequest(id, 'reject');
export const cancelBorrowingRequest = (id: number) => updateRequest(id, 'cancel');

import api from './axios';

export const requestBorrowing = async (
  itemId: number,
  data: {
    contact_id: number;
    expected_return_at?: string;
    notes?: string;
  }
) => {
  const response = await api.post(
    `/items/${itemId}/borrowing-request`,
    data
  );

  return response.data;
};
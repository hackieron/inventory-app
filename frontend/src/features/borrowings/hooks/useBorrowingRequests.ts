import { useCallback, useState } from 'react';
import {
  approveBorrowingRequest,
  cancelBorrowingRequest,
  getIncomingBorrowingRequests,
  getMyBorrowingRequests,
  rejectBorrowingRequest,
} from '@/api/borrowings';
import type { BorrowingRequest } from '@/types/borrowing';

export function useBorrowingRequests() {
  const [mine, setMine] = useState<BorrowingRequest[]>([]);
  const [incoming, setIncoming] = useState<BorrowingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [myRequests, incomingRequests] = await Promise.all([
        getMyBorrowingRequests(),
        getIncomingBorrowingRequests(),
      ]);
      setMine(myRequests);
      setIncoming(incomingRequests);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Unable to load borrowing requests.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(() => { setRefreshing(true); return load(); }, [load]);

  const runAction = useCallback(async (action: 'approve' | 'reject' | 'cancel', id: number) => {
    if (action === 'approve') await approveBorrowingRequest(id);
    if (action === 'reject') await rejectBorrowingRequest(id);
    if (action === 'cancel') await cancelBorrowingRequest(id);
    await load();
  }, [load]);

  return { mine, incoming, loading, refreshing, error, load, refresh, runAction };
}

export type BorrowingRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface BorrowingRequest {
  id: number;
  item_id: number;
  requester_id: number;
  expected_return_at: string | null;
  notes: string | null;
  status: BorrowingRequestStatus;
  item?: {
    id: number;
    name: string;
    image_url?: string | null;
    serial_number?: string | null;
    description?: string | null;
    notes?: string | null;
    category?: { name: string } | null;
    location?: { name: string } | null;
    user?: { id: number; name: string; email?: string | null; avatar?: string | null } | null;
  } | null;
  requester?: { id: number; name: string; email?: string | null } | null;
  created_at: string;
}

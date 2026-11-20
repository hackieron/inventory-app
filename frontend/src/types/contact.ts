export interface Contact {
  id: number;
  user_id: number | null;
  contact_user_id: number | null;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  borrowings_count?: number;
  contact_user?: { id: number; name: string; email?: string | null; avatar?: string | null } | null;
  created_at?: string;
}

export type ContactPayload = Pick<Contact, 'name' | 'email' | 'phone' | 'notes'>;

export interface FriendUser { id: number; name: string; email: string; avatar?: string | null; }
export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';
export interface FriendRequest { id: number; sender_id: number; receiver_id: number; status: FriendRequestStatus; sender?: FriendUser; receiver?: FriendUser; created_at: string; }

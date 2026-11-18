import api from './axios';
import type { Contact, ContactPayload, FriendRequest, FriendUser } from '@/types/contact';

export async function searchUsers(query: string): Promise<FriendUser[]> { const response = await api.get('/users/search', { params: { query } }); return response.data.data; }
export async function getSentFriendRequests(): Promise<FriendRequest[]> { const response = await api.get('/friend-requests/sent'); return response.data.data; }
export async function getIncomingFriendRequests(): Promise<FriendRequest[]> { const response = await api.get('/friend-requests/incoming'); return response.data.data; }
export async function sendFriendRequest(receiverId: number): Promise<FriendRequest> { const response = await api.post('/friend-requests', { receiver_id: receiverId }); return response.data.data; }
export async function respondToFriendRequest(id: number, status: 'accepted' | 'rejected'): Promise<FriendRequest> { const response = await api.patch(`/friend-requests/${id}`, { status }); return response.data.data; }

export async function getContacts(): Promise<Contact[]> {
  const response = await api.get('/contacts');
  return response.data.data;
}

export async function createContact(data: ContactPayload): Promise<Contact> {
  const response = await api.post('/contacts', data);
  return response.data.data;
}

export async function updateContact(id: number, data: ContactPayload): Promise<Contact> {
  const response = await api.put(`/contacts/${id}`, data);
  return response.data.data;
}

export async function deleteContact(id: number): Promise<void> {
  await api.delete(`/contacts/${id}`);
}

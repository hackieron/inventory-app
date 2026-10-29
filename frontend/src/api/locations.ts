import api from './axios';

export interface CreateLocationPayload {
    name: string | null;
    description: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
}

export async function createLocation(
    payload: CreateLocationPayload
): Promise<{ id: number; name: string }> {
    const response = await api.post('/locations', payload);

    return response.data.data;
}
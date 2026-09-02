export interface Contact {
  id: number;
  name: string;
}

export interface ItemHistory {
  id: number;
  item_id: number;
  action: string;
  description: string | null;
  old_location: string | null;
  new_location: string | null;
  contact_id: number | null;
  contact?: Contact | null;
  created_at: string;
  updated_at: string;
}

export interface Borrowing {
  id: number;
  item_id: number;
  contact_id: number;
  borrowed_at: string;
  expected_return_at: string | null;
  returned_at: string | null;
  notes: string | null;
  contact?: Contact | null;
}

export interface Item {
  id: number;

  category_id: number | null;
  location_id: number | null;

  name: string;
  serial_number: string | null;
  status: string;
  purchase_date: string | null;
  image: string | null;
  description: string | null;
  notes: string | null;
  is_borrowable: boolean;
  category?: {
    id: number;
    name: string;
  } | null;

  location?: {
    id: number;
    name: string;
  } | null;

  current_borrowing?: Borrowing | null;

  histories?: ItemHistory[];
}
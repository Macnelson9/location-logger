/** Shapes returned by the Goyin Locations API. */

export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface ApiLocation {
  id: number;
  name: string;
  category: string;
  category_id: number;
  user_id: number;
  lat: number;
  lng: number;
  address: string | null;
  created_at: string;
}

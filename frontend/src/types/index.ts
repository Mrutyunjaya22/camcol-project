export interface User {
  id: string;
  name: string;
  email: string;
  college?: string;
  city?: string;
  bio?: string;
  avatar?: string;
  skills: string[];
  is_verified: boolean;
  rating: number;
  review_count: number;
  created_at: string;
}

export interface Gig {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  price_type: 'fixed' | 'hourly' | 'negotiable';
  delivery_days: number;
  tags: string[];
  images: string[];
  is_active: boolean;
  order_count: number;
  rating: number;
  review_count: number;
  created_at: string;
  // joined
  seller_id?: string;
  seller_name?: string;
  seller_avatar?: string;
  seller_college?: string;
  seller_city?: string;
  seller_bio?: string;
  seller_skills?: string[];
  seller_verified?: boolean;
  seller_rating?: number;
  seller_review_count?: number;
}

export interface Project {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: string;
  required_skills: string[];
  team_size: number;
  duration?: string;
  is_paid: boolean;
  budget?: number;
  status: 'open' | 'in_progress' | 'completed' | 'closed';
  college_only: boolean;
  member_count?: number;
  pending_count?: number;
  created_at: string;
  // joined
  owner_name?: string;
  owner_avatar?: string;
  owner_college?: string;
  owner_city?: string;
  owner_verified?: boolean;
  owner_rating?: number;
}

export interface ProjectMember {
  id: string;
  name: string;
  avatar?: string;
  college?: string;
  skills: string[];
  role?: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
}

export interface Order {
  id: string;
  gig_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'disputed';
  requirements?: string;
  delivery_date?: string;
  created_at: string;
  // joined
  gig_title?: string;
  gig_images?: string[];
  buyer_name?: string;
  buyer_avatar?: string;
  seller_name?: string;
  seller_avatar?: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  gig_id?: string;
  order_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
  reviewer_college?: string;
  gig_title?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

export interface Conversation {
  other_user: string;
  name: string;
  avatar?: string;
  college?: string;
  last_message: string;
  last_message_at: string;
  is_read: boolean;
  sender_id: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  total: number;
  page: number;
  pages: number;
}
export interface DBVideo {
  id: string;
  title: string;
  thumbnail_url: string | null;
  video_url: string | null;
  duration: string | null;
  views: number | null;
  category_id: string | null;
  is_vip: boolean | null;
  active: boolean | null;
  description: string | null;
  created_at: string | null;
}

export interface DBCategory {
  id: string;
  name: string;
  slug: string;
  image_url: string;
}

export interface DBBanner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  is_vip: boolean | null;
}

export interface DBVipPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  banner_url: string | null;
  description: string | null;
  active: boolean | null;
  sort_order: number | null;
}

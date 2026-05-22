export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PostStatus = "draft" | "scheduled" | "published";
export type SubscriberStatus = "pending" | "confirmed" | "unsubscribed";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          dek: string | null;
          body_md: string;
          cover_variant: string | null;
          status: PostStatus;
          featured: boolean;
          published_at: string | null;
          read_time_min: number | null;
          author_id: string | null;
          created_at: string;
          updated_at: string;
          search: unknown;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          dek?: string | null;
          body_md?: string;
          cover_variant?: string | null;
          status?: PostStatus;
          featured?: boolean;
          published_at?: string | null;
          read_time_min?: number | null;
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          dek?: string | null;
          body_md?: string;
          cover_variant?: string | null;
          status?: PostStatus;
          featured?: boolean;
          published_at?: string | null;
          read_time_min?: number | null;
          author_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          slug: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          created_at?: string;
        };
      };
      post_tags: {
        Row: {
          post_id: string;
          tag_id: string;
        };
        Insert: {
          post_id: string;
          tag_id: string;
        };
        Update: {
          post_id?: string;
          tag_id?: string;
        };
      };
      subscribers: {
        Row: {
          id: string;
          email: string;
          status: SubscriberStatus;
          confirmation_token: string | null;
          source: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          status?: SubscriberStatus;
          confirmation_token?: string | null;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          status?: SubscriberStatus;
          confirmation_token?: string | null;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      post_status: PostStatus;
      subscriber_status: SubscriberStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

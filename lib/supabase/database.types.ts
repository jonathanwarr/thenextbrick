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
        Relationships: [];
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
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          slug: string;
          name: string;
          created_at: string;
          group_id: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          created_at?: string;
          group_id?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          created_at?: string;
          group_id?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "tags_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "tag_groups";
            referencedColumns: ["id"];
          },
        ];
      };
      tag_groups: {
        Row: {
          id: string;
          slug: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      subscribers: {
        Row: {
          id: string;
          email: string;
          status: SubscriberStatus;
          confirmation_token: string;
          confirmed_at: string | null;
          unsubscribed_at: string | null;
          source: string | null;
          created_at: string;
          display_name: string | null;
          consent_text: string | null;
          consented_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          status?: SubscriberStatus;
          confirmation_token?: string;
          confirmed_at?: string | null;
          unsubscribed_at?: string | null;
          source?: string | null;
          created_at?: string;
          display_name?: string | null;
          consent_text?: string | null;
          consented_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          status?: SubscriberStatus;
          confirmation_token?: string;
          confirmed_at?: string | null;
          unsubscribed_at?: string | null;
          source?: string | null;
          created_at?: string;
          display_name?: string | null;
          consent_text?: string | null;
          consented_at?: string | null;
        };
        Relationships: [];
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

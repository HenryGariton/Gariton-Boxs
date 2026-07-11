// TypeScript 类型定义 — 对应数据库表结构（Supabase 兼容格式）

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          nickname: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          nickname: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          nickname?: string;
          avatar_url?: string | null;
        };
      };
      cards: {
        Row: {
          id: string;
          user_id: string;
          display_name: string;
          title: string;
          company: string;
          bio: string;
          skills: string[];
          social_links: Record<string, string>;
          contact_email: string;
          phone: string;
          theme_color: string;
          views_count: number;
          likes_count: number;
          comments_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string;
          title?: string;
          company?: string;
          bio?: string;
          skills?: string[];
          social_links?: Record<string, string>;
          contact_email?: string;
          phone?: string;
          theme_color?: string;
          views_count?: number;
          likes_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string;
          title?: string;
          company?: string;
          bio?: string;
          skills?: string[];
          social_links?: Record<string, string>;
          contact_email?: string;
          phone?: string;
          theme_color?: string;
          likes_count?: number;
          comments_count?: number;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          type: "short" | "article";
          title: string;
          content: string;
          excerpt: string;
          cover_image: string | null;
          images: string[];
          likes_count: number;
          comments_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: "short" | "article";
          title?: string;
          content: string;
          excerpt?: string;
          cover_image?: string | null;
          images?: string[];
          likes_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          excerpt?: string;
          cover_image?: string | null;
          images?: string[];
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          target_type: "card" | "post";
          target_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_type: "card" | "post";
          target_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          target_type: "card" | "post";
          target_id: string;
          content: string;
          parent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_type: "card" | "post";
          target_id: string;
          content: string;
          parent_id?: string | null;
          created_at?: string;
        };
        Update: {
          content?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// 便捷别名
export type Tables = Database["public"]["Tables"];

// 便捷类型
export type User = Tables["users"]["Row"];
export type Card = Tables["cards"]["Row"];
export type Post = Tables["posts"]["Row"];
export type Like = Tables["likes"]["Row"];
export type Comment = Tables["comments"]["Row"];

// 带关联数据的类型
export type CardWithUser = Card & {
  users: Pick<User, "nickname" | "avatar_url">;
};

export type PostWithUser = Post & {
  users: Pick<User, "nickname" | "avatar_url">;
};

export type CommentWithUser = Comment & {
  users: Pick<User, "nickname" | "avatar_url">;
};

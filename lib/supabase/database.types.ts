export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'client';
export type TaskCategory =
  'general' | 'work' | 'personal' | 'urgent' | 'shopping';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          full_name: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          email?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          profile_id: string;
          display_name: string;
          company_name: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          display_name: string;
          company_name?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          display_name?: string;
          company_name?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'clients_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          category: TaskCategory;
          client_id: string | null;
          priority: TaskPriority;
          due_date: string | null;
          status: TaskStatus;
          needs_revision: boolean;
          notes: string | null;
          project_url: string | null;
          archived: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
          client_notified_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          category: TaskCategory;
          client_id?: string | null;
          priority?: TaskPriority;
          due_date?: string | null;
          status?: TaskStatus;
          needs_revision?: boolean;
          notes?: string | null;
          project_url?: string | null;
          archived?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          client_notified_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          category?: TaskCategory;
          client_id?: string | null;
          priority?: TaskPriority;
          due_date?: string | null;
          status?: TaskStatus;
          needs_revision?: boolean;
          notes?: string | null;
          project_url?: string | null;
          archived?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          client_notified_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'clients';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      comments: {
        Row: {
          id: string;
          task_id: string;
          author_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          author_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          author_id?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_task_id_fkey';
            columns: ['task_id'];
            isOneToOne: false;
            referencedRelation: 'tasks';
            referencedColumns: ['id'];
          },
        ];
      };
      task_attachments: {
        Row: {
          id: string;
          task_id: string;
          file_name: string;
          storage_path: string;
          mime_type: string;
          file_size: number;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          file_name: string;
          storage_path: string;
          mime_type: string;
          file_size: number;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          file_name?: string;
          storage_path?: string;
          mime_type?: string;
          file_size?: number;
          uploaded_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'task_attachments_task_id_fkey';
            columns: ['task_id'];
            isOneToOne: false;
            referencedRelation: 'tasks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'task_attachments_uploaded_by_fkey';
            columns: ['uploaded_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole | null;
      };
      current_client_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
    };
    Enums: {
      user_role: UserRole;
      task_category: TaskCategory;
      task_priority: TaskPriority;
      task_status: TaskStatus;
    };
  };
}

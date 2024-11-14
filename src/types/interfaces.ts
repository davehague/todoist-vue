export interface Task {
  id: string;
  content: string;
  project_name: string;
  project_id: string;
  section_id: string;
  section_name: string;
  due?: {
    date: string;
    is_recurring: boolean;
    string: string;
  };
  description: string;
  priority: number;
  created_at: string;
  is_completed: boolean;
  labels: string[];
  url: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

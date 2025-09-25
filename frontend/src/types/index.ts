// Core Qylon Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  client_id: string;
  start_time: string;
  end_time?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  transcript?: string;
  action_items?: ActionItem[];
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  id: string;
  meeting_id: string;
  title: string;
  description: string;
  assignee?: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger_type: 'meeting_completed' | 'action_item_created' | 'manual';
  steps: WorkflowStep[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_type: 'send_email' | 'create_task' | 'update_crm' | 'notify_user';
  config: Record<string, any>;
  order: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Component Props Types
export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface MeetingForm {
  title: string;
  description?: string;
  client_id: string;
  start_time: string;
  end_time?: string;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  children?: NavItem[];
}

// Dashboard Types
export interface DashboardStats {
  total_meetings: number;
  active_meetings: number;
  completed_meetings: number;
  pending_action_items: number;
  completed_action_items: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

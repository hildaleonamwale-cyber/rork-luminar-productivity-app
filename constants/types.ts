export type Category = 'work' | 'personal' | 'fitness' | 'learning';

export interface Task {
  id: string;
  title: string;
  category: Category;
  date: string;
  time?: string;
  endTime?: string;
  completed: boolean;
  projectId?: string;
  deleted?: boolean;
  notes?: string;
  emoji?: string;
}

export interface Goal {
  id: string;
  title: string;
  icon: string;
  targetDays: number;
  completedDays: string[];
  startDate: string;
  deleted?: boolean;
  emoji?: string;
  color?: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  deleted?: boolean;
  emoji?: string;
  color?: string;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title?: string;
  content: string;
  deleted?: boolean;
}

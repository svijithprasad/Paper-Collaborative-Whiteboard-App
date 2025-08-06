export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: User[];
  createdAt: Date;
  createdBy: string;
}

export interface Whiteboard {
  id: string;
  name: string;
  teamId: string;
  createdAt: Date;
  createdBy: string;
  lastModified: Date;
  thumbnail?: string;
}

export interface DrawingElement {
  id: string;
  type: 'pen' | 'rectangle' | 'circle' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  text?: string;
  color: string;
  strokeWidth: number;
  selected?: boolean;
  startX?: number;
  startY?: number;
}

export interface CanvasTool {
  id: string;
  name: string;
  icon: string;
  active: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  assignedTo: string;
  createdAt: Date;
  dueDate?: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}
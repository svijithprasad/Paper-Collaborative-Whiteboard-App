import React, { createContext, useContext, useState } from 'react';
import { Team, Whiteboard, Task, ChatMessage } from '../types';

interface AppContextType {
  teams: Team[];
  whiteboards: Whiteboard[];
  tasks: Task[];
  chatMessages: ChatMessage[];
  currentTeam: Team | null;
  currentWhiteboard: Whiteboard | null;
  createTeam: (team: Omit<Team, 'id' | 'createdAt'>) => void;
  joinTeam: (teamId: string) => void;
  selectTeam: (team: Team) => void;
  createWhiteboard: (whiteboard: Omit<Whiteboard, 'id' | 'createdAt' | 'lastModified'>) => void;
  selectWhiteboard: (whiteboard: Whiteboard) => void;
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  toggleTask: (taskId: string) => void;
  sendMessage: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [currentWhiteboard, setCurrentWhiteboard] = useState<Whiteboard | null>(null);

  const createTeam = (teamData: Omit<Team, 'id' | 'createdAt'>) => {
    const newTeam: Team = {
      ...teamData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setTeams(prev => [...prev, newTeam]);
  };

  const joinTeam = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      setCurrentTeam(team);
    }
  };

  const selectTeam = (team: Team) => {
    setCurrentTeam(team);
    setCurrentWhiteboard(null);
  };

  const createWhiteboard = (whiteboardData: Omit<Whiteboard, 'id' | 'createdAt' | 'lastModified'>) => {
    const newWhiteboard: Whiteboard = {
      ...whiteboardData,
      id: Date.now().toString(),
      createdAt: new Date(),
      lastModified: new Date(),
    };
    setWhiteboards(prev => [...prev, newWhiteboard]);
  };

  const selectWhiteboard = (whiteboard: Whiteboard) => {
    setCurrentWhiteboard(whiteboard);
  };

  const createTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const sendMessage = (message: string) => {
    if (!currentTeam) return;
    
    // Get current user from localStorage (simplified for demo)
    const savedUser = localStorage.getItem('paper_user');
    if (!savedUser) return;
    
    const user = JSON.parse(savedUser);
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      message,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  return (
    <AppContext.Provider value={{
      teams,
      whiteboards,
      tasks,
      chatMessages,
      currentTeam,
      currentWhiteboard,
      createTeam,
      joinTeam,
      selectTeam,
      createWhiteboard,
      selectWhiteboard,
      createTask,
      toggleTask,
      sendMessage,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
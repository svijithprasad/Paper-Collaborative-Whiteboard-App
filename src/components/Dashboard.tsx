import React, { useState } from 'react';
import { Plus, Users, FileImage, LogOut, Search, CheckSquare, MessageCircle, Calendar, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import CreateTeamModal from './CreateTeamModal';
import CreateWhiteboardModal from './CreateWhiteboardModal';
import TaskModal from './TaskModal';

interface DashboardProps {
  onOpenWhiteboard: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onOpenWhiteboard }) => {
  const { user, logout } = useAuth();
  const { 
    teams, 
    whiteboards, 
    tasks, 
    chatMessages, 
    currentTeam, 
    selectTeam, 
    selectWhiteboard, 
    toggleTask, 
    sendMessage 
  } = useApp();
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showCreateWhiteboard, setShowCreateWhiteboard] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'whiteboards' | 'tasks' | 'chat'>('whiteboards');
  const [newMessage, setNewMessage] = useState('');

  const userTeams = teams.filter(team => 
    team.members.some(member => member.id === user?.id) || team.createdBy === user?.id
  );

  const currentTeamWhiteboards = whiteboards.filter(wb => wb.teamId === currentTeam?.id);
  const currentTeamTasks = tasks.filter(task => currentTeam?.members.some(member => member.id === task.assignedTo));
  const currentTeamMessages = chatMessages.filter(() => currentTeam); // Simplified for demo

  const filteredWhiteboards = currentTeamWhiteboards.filter(wb =>
    wb.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleWhiteboardClick = (whiteboard: any) => {
    selectWhiteboard(whiteboard);
    onOpenWhiteboard();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  const tabs = [
    { id: 'whiteboards', name: 'Whiteboards', icon: FileImage },
    { id: 'tasks', name: 'Tasks', icon: CheckSquare },
    { id: 'chat', name: 'Chat', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white/80 backdrop-blur-md border-r border-gray-200/50 flex flex-col shadow-lg">
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Paper</h1>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-semibold">
                {user?.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Teams</h2>
                <button
                  onClick={() => setShowCreateTeam(true)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                {userTeams.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50/50 rounded-xl">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No teams yet</p>
                    <button
                      onClick={() => setShowCreateTeam(true)}
                      className="mt-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Create your first team
                    </button>
                  </div>
                ) : (
                  userTeams.map(team => (
                    <button
                      key={team.id}
                      onClick={() => selectTeam(team)}
                      className={`w-full text-left p-4 rounded-xl border transition-all transform hover:scale-[1.02] ${
                        currentTeam?.id === team.id
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-900 shadow-md'
                          : 'bg-white/50 border-gray-200 hover:border-blue-300 text-gray-900 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                          currentTeam?.id === team.id ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-gray-600 to-gray-700'
                        }`}>
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{team.name}</p>
                          <p className="text-sm opacity-70">{team.members.length} members</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 p-6 shadow-sm">
          {currentTeam ? (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentTeam.name}</h1>
              <p className="text-gray-600">{currentTeam.description}</p>
              
              {/* Tabs */}
              <div className="flex space-x-1 mt-6 bg-gray-100 p-1 rounded-xl w-fit">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Paper</h1>
              <p className="text-gray-600">Select a team to view whiteboards or create your first team</p>
            </div>
          )}
        </div>

        <div className="flex-1 p-6">
          {currentTeam ? (
            <>
              {/* Whiteboards Tab */}
              {activeTab === 'whiteboards' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Whiteboards</h2>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search whiteboards..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                        />
                      </div>
                      <button
                        onClick={() => setShowCreateWhiteboard(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 flex items-center space-x-2"
                      >
                        <Plus className="h-5 w-5" />
                        <span>New Whiteboard</span>
                      </button>
                    </div>
                  </div>

                  {filteredWhiteboards.length === 0 ? (
                    <div className="text-center py-16 bg-white/50 rounded-2xl backdrop-blur-sm">
                      <FileImage className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchQuery ? 'No whiteboards found' : 'No whiteboards yet'}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {searchQuery 
                          ? 'Try adjusting your search terms' 
                          : 'Create your first whiteboard to start collaborating'
                        }
                      </p>
                      {!searchQuery && (
                        <button
                          onClick={() => setShowCreateWhiteboard(true)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
                        >
                          Create Whiteboard
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredWhiteboards.map(whiteboard => (
                        <div
                          key={whiteboard.id}
                          onClick={() => handleWhiteboardClick(whiteboard)}
                          className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer group transform hover:scale-[1.02]"
                        >
                          <div className="aspect-video bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl mb-4 flex items-center justify-center group-hover:from-blue-50 group-hover:to-purple-50 transition-all">
                            <FileImage className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">{whiteboard.name}</h3>
                          <p className="text-sm text-gray-500">
                            Modified {whiteboard.lastModified.toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tasks Tab */}
              {activeTab === 'tasks' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Team Tasks</h2>
                    <button
                      onClick={() => setShowCreateTask(true)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 flex items-center space-x-2"
                    >
                      <Plus className="h-5 w-5" />
                      <span>New Task</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {currentTeamTasks.length === 0 ? (
                      <div className="text-center py-16 bg-white/50 rounded-2xl backdrop-blur-sm">
                        <CheckSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                        <p className="text-gray-500 mb-6">Create your first task to get organized</p>
                        <button
                          onClick={() => setShowCreateTask(true)}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
                        >
                          Create Task
                        </button>
                      </div>
                    ) : (
                      currentTeamTasks.map(task => (
                        <div
                          key={task.id}
                          className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all"
                        >
                          <div className="flex items-start space-x-4">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                task.completed
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300 hover:border-green-500'
                              }`}
                            >
                              {task.completed && <CheckSquare className="h-3 w-3" />}
                            </button>
                            <div className="flex-1">
                              <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {task.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                              {task.dueDate && (
                                <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                                  <Calendar className="h-3 w-3" />
                                  <span>Due {task.dueDate.toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <div className="h-full flex flex-col">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Team Chat</h2>
                  
                  <div className="flex-1 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 flex flex-col">
                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                      {currentTeamMessages.length === 0 ? (
                        <div className="text-center py-16">
                          <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                          <p className="text-gray-500">Start a conversation with your team</p>
                        </div>
                      ) : (
                        currentTeamMessages.map(message => (
                          <div key={message.id} className="flex space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-semibold">
                                {message.userName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900">{message.userName}</span>
                                <span className="text-xs text-gray-500">
                                  {message.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-gray-700">{message.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim()}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                        >
                          <Send className="h-5 w-5" />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white/50 rounded-2xl backdrop-blur-sm">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a team</h3>
              <p className="text-gray-500">Choose a team from the sidebar to view whiteboards</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateTeamModal
        isOpen={showCreateTeam}
        onClose={() => setShowCreateTeam(false)}
      />
      
      <CreateWhiteboardModal
        isOpen={showCreateWhiteboard}
        onClose={() => setShowCreateWhiteboard(false)}
        teamId={currentTeam?.id || ''}
      />
      
      <TaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        teamMembers={currentTeam?.members || []}
      />
    </div>
  );
};

export default Dashboard;
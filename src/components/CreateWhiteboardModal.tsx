import React, { useState } from 'react';
import { X, FileImage } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

interface CreateWhiteboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
}

const CreateWhiteboardModal: React.FC<CreateWhiteboardModalProps> = ({ isOpen, onClose, teamId }) => {
  const { user } = useAuth();
  const { createWhiteboard } = useApp();
  const [whiteboardName, setWhiteboardName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !teamId) return;

    createWhiteboard({
      name: whiteboardName,
      teamId,
      createdBy: user.id,
    });

    setWhiteboardName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-in fade-in-0 zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileImage className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Whiteboard</h2>
          <p className="text-gray-600">Start a new collaborative whiteboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="whiteboard-name" className="block text-sm font-medium text-gray-700 mb-2">
              Whiteboard Name
            </label>
            <input
              type="text"
              id="whiteboard-name"
              value={whiteboardName}
              onChange={(e) => setWhiteboardName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Enter whiteboard name"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              Create Whiteboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWhiteboardModal;
import React from 'react';
import { Brain } from 'lucide-react';
import Chat from './components/Chat';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Maca AI</h1>
            </div>
            <p className="text-sm text-gray-500">YouTube Video Summarizer</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg min-h-[calc(100vh-12rem)]">
          <Chat />
        </div>
      </main>
    </div>
  );
}

export default App
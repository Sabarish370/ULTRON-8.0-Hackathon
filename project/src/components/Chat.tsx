import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Youtube, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateResponse } from '../lib/gemini';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface YouTubePlayerProps {
  videoId: string;
  timestamp: number;
  onClose: () => void;
}

function YouTubePlayer({ videoId, timestamp, onClose }: YouTubePlayerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">YouTube Video</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="relative pt-[56.25%]">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?start=${timestamp}&autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}

function isYouTubeUrl(url: string) {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return pattern.test(url);
}

function extractVideoId(url: string) {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function convertTimestampToSeconds(timestamp: string): number {
  const [minutes, seconds] = timestamp.split(':').map(Number);
  return minutes * 60 + seconds;
}

function MarkdownWithTimestamps({ content, videoId }: { content: string; videoId: string | null }) {
  const [playerState, setPlayerState] = useState<{ isOpen: boolean; timestamp: number }>({
    isOpen: false,
    timestamp: 0,
  });

  const handleTimestampClick = (timestamp: string) => {
    if (!videoId) return;
    const seconds = convertTimestampToSeconds(timestamp);
    setPlayerState({ isOpen: true, timestamp: seconds });
  };

  const renderContent = () => {
    const lines = content.split('\n');
    return lines.map((line, lineIndex) => {
      const timestampRegex = /\[(\d{2}:\d{2})\]/g;
      let lastIndex = 0;
      const parts = [];
      let match;

      while ((match = timestampRegex.exec(line)) !== null) {
        // Add text before the timestamp
        if (match.index > lastIndex) {
          parts.push(line.slice(lastIndex, match.index));
        }

        // Add the timestamp as a button
        const timestamp = match[1];
        parts.push(
          <button
            key={`${lineIndex}-${match.index}`}
            onClick={() => handleTimestampClick(timestamp)}
            className="text-blue-600 hover:underline font-medium mx-1"
          >
            [{timestamp}]
          </button>
        );

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text after last timestamp
      if (lastIndex < line.length) {
        parts.push(line.slice(lastIndex));
      }

      return (
        <div key={lineIndex} className="mb-4">
          {parts.length > 0 ? parts : line}
        </div>
      );
    });
  };

  return (
    <>
      <div className="prose max-w-none dark:prose-invert">
        {renderContent()}
      </div>
      {playerState.isOpen && videoId && (
        <YouTubePlayer
          videoId={videoId}
          timestamp={playerState.timestamp}
          onClose={() => setPlayerState({ isOpen: false, timestamp: 0 })}
        />
      )}
    </>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setError(null);

    if (!isYouTubeUrl(input)) {
      setError('Please provide a valid YouTube video URL');
      return;
    }

    const videoId = extractVideoId(input);
    if (!videoId) {
      setError('Could not extract video ID from the URL');
      return;
    }

    setCurrentVideoId(videoId);
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const prompt = `Please provide an extremely detailed analysis of this YouTube video (ID: ${videoId}). I want you to break down every single detail and concept discussed in the video. Your response should follow this format:

1. Brief Overview (10-15 detailed sentences explaining the video's purpose and scope)
2. Key Points with Timestamps:
   - [MM:SS] Include EVERY significant moment, concept, or demonstration
   - For each timestamp, provide extensive detail about what's being discussed
   - Don't summarize - explain everything as if teaching someone who can't watch the video
   - Include direct quotes when relevant
   - Describe visual demonstrations in detail

Note: Please maintain exact [MM:SS] timestamp format for all time markers.`;
      
      const response = await generateResponse(prompt);
      const assistantMessage = { role: 'assistant' as const, content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while analyzing the video. Please make sure you have configured your Gemini API key correctly and try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Youtube className="w-16 h-16 mb-4" />
            <p className="text-xl font-semibold">Paste a YouTube URL to get started</p>
            <p className="text-sm">I'll provide a detailed summary with clickable timestamps</p>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white shadow-md'
              }`}
            >
              {message.role === 'user' ? (
                <div className="flex items-center space-x-2">
                  <Youtube className="w-4 h-4" />
                  <span>{message.content}</span>
                </div>
              ) : (
                <MarkdownWithTimestamps content={message.content} videoId={currentVideoId} />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        {error && (
          <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">
            {error}
          </div>
        )}
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste YouTube video URL here..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
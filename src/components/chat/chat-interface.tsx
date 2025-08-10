'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Send, Trash2, Menu } from 'lucide-react';
import { ChatMessage } from './chat-message';
import { WormGPTSolidLogo } from '../icons';
import { Skeleton } from '../ui/skeleton';
import { Bot } from 'lucide-react';
import type { Message, Conversation } from '@/lib/types';
import { ChatInfoPanel } from './chat-info-panel';
import { useSidebar } from '../ui/sidebar';
import { useSettings } from '@/context/settings-context';
import type { getVeniceResponse as getVeniceResponseType } from '@/app/actions';

interface ChatInterfaceProps {
  conversation: Conversation;
  onMessageAdd: (message: Message, isNew: boolean) => void;
  onConversationClear: (conversationId: string) => void;
  onMessageDelete: (messageId: string) => void;
  getVeniceResponse: typeof getVeniceResponseType;
}

export function ChatInterface({ conversation, onMessageAdd, onConversationClear, onMessageDelete, getVeniceResponse }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
  const [showInfo, setShowInfo] = useState(false);
  const { toggleSidebar } = useSidebar();
  const { settings } = useSettings();


  useEffect(() => {
    if (scrollAreaViewportRef.current) {
        scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight;
    }
  }, [conversation.messages, isLoading, showInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (input.trim().toLowerCase() === 'info_check') {
        setShowInfo(prev => !prev);
        setInput('');
        return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      audio: null
    };

    onMessageAdd(userMessage, true);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    const response = await getVeniceResponse({
        prompt: currentInput,
        withAudio: settings.voiceMode,
        voice: settings.voice,
    });
    
    const assistantMessage: Message = {
      id: Date.now().toString() + '-ai',
      role: 'assistant',
      content: response.message || "Sorry, something went wrong. Please try again.",
      audio: response.audio
    };
    onMessageAdd(assistantMessage, true);
    
    setIsLoading(false);
    setShowInfo(false);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
       <header className="flex shrink-0 items-center gap-4 border-b border-border px-4 py-3 sm:px-6">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
        </Button>
        <WormGPTSolidLogo className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold tracking-tight">{conversation.name}</h1>
        <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => onConversationClear(conversation.id)} aria-label="Clear conversation messages">
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" viewportRef={scrollAreaViewportRef}>
          <div className="space-y-6 p-4 md:p-6">
            {conversation.messages.map((message, index) => (
              <ChatMessage 
                key={message.id} 
                {...message} 
                onDelete={onMessageDelete}
                isLastMessage={index === conversation.messages.length - 1} 
              />
            ))}
            {isLoading && (
              <div className="flex animate-fade-in items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="max-w-[75%] space-y-2 rounded-lg bg-muted p-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
              </div>
            )}
            {showInfo && <ChatInfoPanel />}
          </div>
          <ScrollBar orientation="vertical" />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </main>
      <footer className="shrink-0 border-t border-border p-2 sm:p-4 bg-background">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask WormGPT..."
            className="flex-1"
            disabled={isLoading}
            autoComplete="off"
          />
          <Button type="submit" disabled={isLoading} size="icon" aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}

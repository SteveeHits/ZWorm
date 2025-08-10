'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { getVeniceResponse } from '@/app/actions';
import { ChatMessage } from './chat-message';
import { VeniceLogo } from '../icons';
import { Skeleton } from '../ui/skeleton';
import { Bot } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialMessage = async () => {
      const response = await getVeniceResponse("initial");
      if (response.success) {
        setMessages([
          {
            id: 'initial',
            role: 'assistant',
            content: response.message,
          },
        ]);
      }
      setIsLoading(false);
    };
    fetchInitialMessage();
  }, []);

  useEffect(() => {
    if (scrollAreaViewportRef.current) {
        scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    const response = await getVeniceResponse(currentInput);
    
    const assistantMessage: Message = {
      id: Date.now().toString() + '-ai',
      role: 'assistant',
      content: response.success ? response.message : "Sorry, something went wrong. Please try again.",
    };
    setMessages((prev) => [...prev, assistantMessage]);
    
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex shrink-0 items-center gap-4 border-b px-4 py-3 sm:px-6">
        <VeniceLogo className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold tracking-tight">Venice AI</h1>
      </header>
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" viewportRef={scrollAreaViewportRef}>
          <div className="space-y-6 p-4 md:p-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} {...message} />
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
          </div>
        </ScrollArea>
      </main>
      <footer className="shrink-0 border-t p-2 sm:p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask Venice AI..."
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

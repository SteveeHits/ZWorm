
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Send, Trash2, Menu, Square, HelpCircle, Paperclip } from 'lucide-react';
import { ChatMessage } from './chat-message';
import { Skeleton } from '../ui/skeleton';
import { Bot } from 'lucide-react';
import type { Message, Conversation } from '@/lib/types';
import { ChatInfoPanel } from './chat-info-panel';
import { useSidebar } from '../ui/sidebar';
import type { getVeniceResponse as getVeniceResponseType } from '@/app/actions';
import { getFileAnalysis } from '@/app/actions';
import { useSettings } from '@/context/settings-context';
import { textToSpeech } from '@/ai/flows/tts-flow';
import { InfoDialog } from './info-dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


interface ChatInterfaceProps {
  conversation: Conversation;
  onMessageAdd: (message: Message, isNew: boolean) => void;
  onMessageUpdate: (messageId: string, newContent: string) => void;
  onConversationClear: (conversationId: string) => void;
  onMessageDelete: (messageId: string) => void;
  getVeniceResponse: typeof getVeniceResponseType;
  lastMessageIsNew: boolean;
}

export function ChatInterface({ 
  conversation, 
  onMessageAdd, 
  onMessageUpdate, 
  onConversationClear, 
  onMessageDelete, 
  getVeniceResponse, 
  lastMessageIsNew 
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
  const [showInfo, setShowInfo] = useState(false);
  const { toggleSidebar } = useSidebar();
  const abortControllerRef = useRef<AbortController | null>(null);
  const { settings } = useSettings();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl || '';
      if(audioUrl) {
          audioRef.current.play().catch(e => console.error("Audio playback failed", e));
      }
    }
  }, [audioUrl]);


  useEffect(() => {
    if (scrollAreaViewportRef.current) {
        scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight;
    }
  }, [conversation.messages, isLoading, showInfo]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added, but only if user is near the bottom
    if (scrollAreaViewportRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollAreaViewportRef.current;
        const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100;
        if (isAtBottom) {
            scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight;
        }
    }
  }, [conversation.messages.length > 0 ? conversation.messages[conversation.messages.length - 1].content : null]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `[FILE:${file.name}]`,
    };
    onMessageAdd(userMessage, true);
    
    const assistantMessageId = Date.now().toString() + '-ai-analysis';
    onMessageAdd({ id: assistantMessageId, role: 'assistant', content: 'Analyzing file...' }, true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileDataUri = event.target?.result as string;
        if (fileDataUri) {
          // The getFileAnalysis function is now a direct server action call
          const analysis = await getFileAnalysis(fileDataUri, file.name);
          
          if(analysis.fileType === 'error') {
            onMessageUpdate(assistantMessageId, `Error: ${analysis.description}`);
            setIsLoading(false);
            return;
          }
          
          // For the user, show "Done."
          onMessageUpdate(assistantMessageId, 'Done.');
          
          // For the AI, add the full analysis as a new context message.
          const contextMessage: Message = {
            id: Date.now().toString() + '-context',
            role: 'user', // It's context from the user, for the AI
            content: `[CONTEXT]${analysis.description}`,
          };
          onMessageAdd(contextMessage, false);

          setIsLoading(false);

        }
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        toast({
          variant: 'destructive',
          title: 'File Read Error',
          description: 'Could not read the selected file.',
        });
        setIsLoading(false);
      };
      reader.readAsDataURL(file);

    } catch (error) {
       console.error('Error processing file:', error);
       toast({
          variant: 'destructive',
          title: 'File Processing Error',
          description: 'An error occurred while processing the file.',
        });
        onMessageUpdate(assistantMessageId, 'Sorry, there was an error processing your file.');
        setIsLoading(false);
    } finally {
        // Reset file input
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    setAudioUrl(null);

    if (isLoading) {
      stopGenerating();
      return;
    }

    if (input.trim().toLowerCase() === 'info_check') {
        setShowInfo(prev => !prev);
        setInput('');
        return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    
    // Create an optimistic list of messages to send to the AI
    const messagesForApi = [...conversation.messages, userMessage];
    
    onMessageAdd(userMessage, true);
    setInput('');
    setIsLoading(true);

    const assistantMessageId = Date.now().toString() + '-ai';
    onMessageAdd({
        id: assistantMessageId,
        role: 'assistant',
        content: '',
    }, true);

    try {
        const stream = await getVeniceResponse(messagesForApi);
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let accumulatedResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            accumulatedResponse += chunk;
            onMessageUpdate(assistantMessageId, accumulatedResponse);
        }

        if (settings.voiceModeEnabled) {
            try {
                const ttsResponse = await textToSpeech({ text: accumulatedResponse, voice: settings.voice });
                if (ttsResponse?.media) {
                    setAudioUrl(ttsResponse.media);
                }
            } catch (e) {
                console.error("TTS failed", e);
            }
        }
    } catch (error: any) {
        if (error.name !== 'AbortError') {
            const errorMessage = `Sorry, I am having trouble connecting to the AI. Error: ${error.message}`;
            onMessageUpdate(assistantMessageId, errorMessage);
        } else {
            onMessageUpdate(assistantMessageId, 'Request cancelled.');
        }
    } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
        setShowInfo(false);
    }
  };
  
  const showWelcome = conversation.messages.length === 0;

  return (
    <div className="flex h-screen flex-col bg-background">
      <InfoDialog open={isInfoOpen} onOpenChange={setIsInfoOpen} />
       <header className="flex shrink-0 items-center gap-4 border-b border-border px-4 py-3 sm:px-6">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold tracking-tight">{conversation.name}</h1>
        <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsInfoOpen(true)} aria-label="Show AI information">
                <HelpCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onConversationClear(conversation.id)} aria-label="Clear conversation messages">
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {showWelcome ? (
            <div className="h-full flex flex-col items-center justify-center">
                <h2 className="text-3xl font-bold">Welcome User</h2>
            </div>
        ) : (
            <ScrollArea className="h-full" viewportRef={scrollAreaViewportRef}>
                <div className="space-y-6 p-4 md:p-6">
                    {conversation.messages.map((message, index) => (
                    <ChatMessage 
                        key={message.id} 
                        {...message} 
                        onDelete={onMessageDelete}
                        isLastMessage={index === conversation.messages.length - 1 && lastMessageIsNew} 
                        isStreaming={isLoading && index === conversation.messages.length - 1}
                        isLoading={isLoading && index === conversation.messages.length - 1}
                    />
                    ))}
                    {isLoading && conversation.messages[conversation.messages.length -1].role === 'user' && (
                       <ChatMessage id="loading" role="assistant" content="" onDelete={() => {}} isLastMessage={true} isStreaming={true} isLoading={true} />
                    )}
                    {showInfo && <ChatInfoPanel />}
                </div>
                <ScrollBar orientation="vertical" />
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        )}
      </main>
      <footer className="shrink-0 border-t border-border p-2 sm:p-4 bg-background">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-4 w-4" />
            <span className="sr-only">Attach file</span>
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            className="hidden"
          />
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={"Ask WormGPT..."}
            className="flex-1"
            autoComplete="off"
            disabled={isLoading}
          />
          {isLoading ? (
            <Button type="button" variant="outline" size="icon" onClick={stopGenerating} aria-label="Stop generating">
                <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" size="icon" aria-label="Send message">
                <Send className="h-4 w-4" />
            </Button>
          )}
        </form>
         <audio ref={audioRef} className="hidden" />
      </footer>
    </div>
  );
}

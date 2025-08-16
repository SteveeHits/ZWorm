
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Copy, Check, Terminal, Link as LinkIcon, MoreHorizontal, Trash2, Paperclip, File as FileIcon, RotateCw, Wand2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import Image from 'next/image';

interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  onDelete: (id: string) => void;
  onRetry: () => void;
  onContinue: (id: string) => void;
  isLastMessage: boolean;
  isStreaming?: boolean;
  isLoading?: boolean;
}

function CodeBlock({ language, code }: { language: string, code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLanguage = language === 'sh' ? 'shell' : language;

  return (
    <div className="my-2 rounded-md border bg-black text-sm text-white">
      <div className="flex items-center justify-between rounded-t-md bg-zinc-800 px-3 py-1.5">
        <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            <span className="font-mono text-xs">{displayLanguage || 'code'}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-zinc-700 hover:text-white" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <div className="max-h-96 overflow-auto">
        <pre className="p-3"><code className={`language-${language}`}>{code}</code></pre>
      </div>
    </div>
  );
}

function SimpleMarkdown({ content }: { content: string }) {
    const lines = content.split('\n');
    const elements: (JSX.Element | string)[] = [];
    let inCodeBlock = false;
    let codeBlockContent = '';
    let codeBlockLang = '';

    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const renderParagraph = (line: string, key: string) => {
        const parts = line.split(urlRegex);
        return (
             <p key={key} className="leading-relaxed whitespace-pre-wrap">
                {parts.map((part, j) => {
                    if (urlRegex.test(part)) {
                        return <a key={j} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-500">{part}</a>
                    }
                    const boldMatch = part.match(/\*\*(.*?)\*\*/);
                    if (boldMatch) {
                        return <strong key={j}>{boldMatch[1]}</strong>
                    }
                    return part;
                })}
            </p>
        )
    };


    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().startsWith("```")) {
            if (inCodeBlock) {
                elements.push(<CodeBlock key={`code-${elements.length}`} language={codeBlockLang} code={codeBlockContent.trim()} />);
                codeBlockContent = '';
                codeBlockLang = '';
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
                codeBlockLang = line.substring(3).trim().toLowerCase();
            }
        } else if (inCodeBlock) {
            codeBlockContent += line + '\n';
        } else {
            elements.push(renderParagraph(line, `p-${elements.length}`));
        }
    }
     if (inCodeBlock) {
        elements.push(<CodeBlock key={`code-${elements.length}`} language={codeBlockLang} code={codeBlockContent.trim()} />);
    }

    return <div className="space-y-2">{elements}</div>;
}

interface MessageActionsProps {
  isUser: boolean;
  canBeDeleted: boolean;
  onCopy: () => void;
  onDelete: () => void;
  copied: boolean;
}

const MessageActions = ({ isUser, canBeDeleted, onCopy, onDelete, copied }: MessageActionsProps) => (
  <DropdownMenu>
      <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
          </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isUser ? "end" : "start"}>
          <DropdownMenuItem onClick={onCopy}>
              {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
              Copy
          </DropdownMenuItem>
          {canBeDeleted && (
              <DropdownMenuItem onClick={() => onDelete(id)} className="text-red-500 focus:text-red-500">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
              </DropdownMenuItem>
          )}
      </DropdownMenuContent>
  </DropdownMenu>
);


export function ChatMessage({ id, role, content, onDelete, onRetry, onContinue, isLastMessage, isStreaming, isLoading }: ChatMessageProps) {
  const isUser = role === 'user';
  const isContextMessage = content.startsWith('[CONTEXT]') || content.startsWith('[DEVICE_CONTEXT]') || content.startsWith('[CONTINUE]');
  const isFileMessage = content.startsWith('[FILE:');
  
  if (isContextMessage) {
    return null; // Don't render context messages in the UI
  }

  let displayContent = content;
  if(isFileMessage) displayContent = content.substring(content.indexOf(']') + 1, content.length);
  if(isFileMessage && !displayContent) displayContent = content.substring(6, content.length-1);
  
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const canBeDeleted = id !== 'initial';
  
  const isImageFile = (content: string) => {
    return content.startsWith('data:image');
  }

  const isAnalysisMessage = content.startsWith('Analyzing file:');

  return (
    <div
      className={cn(
        'group flex flex-col animate-fade-in',
        isUser ? 'items-end' : 'items-start'
      )}
    >
      <div className={cn('flex w-full items-start gap-3', isUser ? 'justify-end' : 'justify-start')}>
        {!isUser && (
          <Avatar className="h-8 w-8 shrink-0 bg-black text-primary-foreground">
             <Image src="/logo.png" alt="WormGPT" width={32} height={32} className="rounded-full" />
          </Avatar>
        )}
        <div className={cn("flex items-start gap-1", isUser ? 'flex-row-reverse' : 'flex-row')}>
          <div
              className={cn(
              'max-w-[75vw] sm:max-w-md md:max-w-lg lg:max-w-2xl rounded-lg p-3 text-sm shadow-md',
              isUser
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
          >
              {isFileMessage ? (
                <div className="flex items-center gap-2">
                  <FileIcon className="h-5 w-5" />
                  <span>{displayContent}</span>
                </div>
              ) : (isUser ? displayContent : <SimpleMarkdown content={displayContent} />)}

              {isLoading && content.length === 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="animate-pulse">Thinking...</span>
                  </div>
              )}
               {isAnalysisMessage && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="animate-pulse">{content}</span>
                  </div>
              )}
              {isStreaming && content.length > 0 && <span className="animate-pulse">▍</span>}
          </div>
          <MessageActions 
            isUser={isUser}
            canBeDeleted={canBeDeleted}
            onCopy={handleCopy}
            onDelete={() => onDelete(id)}
            copied={copied}
          />
        </div>
        {isUser && (
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>

       {!isUser && !isStreaming && content.length > 0 && !isAnalysisMessage && (
        <div className="mt-2 flex items-center gap-2 pl-11 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRetry}>
              <RotateCw className="h-4 w-4" />
              <span className="sr-only">Retry</span>
           </Button>
           <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onContinue(id)}>
              <Wand2 className="h-4 w-4" />
              <span className="sr-only">Continue</span>
           </Button>
        </div>
      )}
    </div>
  );
}

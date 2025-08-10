'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Copy, Check, Terminal, Link as LinkIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

function CodeBlock({ language, code }: { language: string, code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-md border bg-black text-sm text-white">
      <div className="flex items-center justify-between rounded-t-md bg-zinc-800 px-3 py-1.5">
        <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            <span className="font-mono text-xs">{language || 'code'}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-zinc-700 hover:text-white" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <pre className="overflow-x-auto p-3"><code className={`language-${language}`}>{code}</code></pre>
    </div>
  );
}

function SimpleMarkdown({ content }: { content: string }) {
    const lines = content.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeBlockContent = '';
    let codeBlockLang = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith("```")) {
            if (inCodeBlock) {
                elements.push(<CodeBlock key={elements.length} language={codeBlockLang} code={codeBlockContent.trim()} />);
                codeBlockContent = '';
                codeBlockLang = '';
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
                codeBlockLang = line.substring(3).trim();
            }
        } else if (inCodeBlock) {
            codeBlockContent += line + '\n';
        } else {
            const parts = line.split(/(\[.*?\]\(.*?\))/g);
            elements.push(
                <p key={i} className="leading-relaxed">
                    {parts.map((part, j) => {
                        const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                        if (linkMatch) {
                            return (
                                <a key={j} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent underline hover:text-accent/80">
                                    {linkMatch[1]}
                                    <LinkIcon className="h-3 w-3" />
                                </a>
                            );
                        }
                        return part;
                    })}
                </p>
            );
        }
    }
     if (inCodeBlock) {
        elements.push(<CodeBlock key={elements.length} language={codeBlockLang} code={codeBlockContent.trim()} />);
    }

    return <div className="space-y-2">{elements}</div>;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'group flex items-start gap-3 animate-fade-in',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0 bg-primary text-primary-foreground">
          <AvatarFallback>
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div className="relative flex items-start">
        {!isUser && (
             <Button variant="ghost" size="icon" className="absolute -left-10 top-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </Button>
        )}
        <div
            className={cn(
            'max-w-[75%] rounded-lg p-3 text-sm shadow-md',
            isUser
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}
        >
            {isUser ? content : <SimpleMarkdown content={content} />}
        </div>
        {isUser && (
            <Button variant="ghost" size="icon" className="absolute -right-10 top-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </Button>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

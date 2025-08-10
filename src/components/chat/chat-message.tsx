'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

function SimpleMarkdown({ content }: { content: string }) {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: JSX.Element[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(<ol key={`list-${elements.length}`} className="list-decimal list-inside space-y-1 my-2">{listItems}</ol>);
            listItems = [];
        }
    };

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.match(/^\d+\./)) {
            listItems.push(<li key={index}>{trimmedLine.replace(/^\d+\.\s*/, '')}</li>);
        } else {
            flushList();
            if (trimmedLine) {
                elements.push(<p key={index}>{trimmedLine}</p>);
            }
        }
    });

    flushList();

    return <div className="space-y-2">{elements}</div>;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user';
  return (
    <div
      className={cn(
        'flex items-start gap-4 animate-fade-in',
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
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

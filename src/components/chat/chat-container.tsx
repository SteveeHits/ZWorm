'use client';
import { useState, useEffect } from 'react';
import type { Conversation, Message } from '@/lib/types';
import { ChatInterface } from './chat-interface';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '../ui/sidebar';
import { Button } from '../ui/button';
import { PlusCircle, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { Input } from '../ui/input';
import { WormGPTSolidLogo } from '../icons';
import { cn } from '@/lib/utils';

const initialConversation: Conversation = {
    id: '1',
    name: 'New Conversation',
    messages: [
        {
            id: 'initial',
            role: 'assistant',
            content: "Welcome to WormGPT! I'm powered by OpenRouter. How can I help you today?",
        },
    ],
    createdAt: new Date().toISOString()
};

export function ChatContainer() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    useEffect(() => {
        try {
            const storedConversations = localStorage.getItem('conversations');
            if (storedConversations) {
                const parsed = JSON.parse(storedConversations);
                if(Array.isArray(parsed) && parsed.length > 0) {
                    setConversations(parsed);
                    const lastConversation = localStorage.getItem('activeConversationId');
                    if (lastConversation && parsed.find(c => c.id === lastConversation)) {
                        setActiveConversationId(lastConversation);
                    } else {
                        setActiveConversationId(parsed[0].id);
                    }
                } else {
                    // Handle empty or invalid data
                    startNewConversation();
                }
            } else {
                startNewConversation();
            }
        } catch (error) {
            console.error("Failed to parse conversations from localStorage", error);
            startNewConversation();
        }
    }, []);
    
    useEffect(() => {
        if (conversations.length > 0) {
            localStorage.setItem('conversations', JSON.stringify(conversations));
        }
        if(activeConversationId) {
            localStorage.setItem('activeConversationId', activeConversationId);
        }
    }, [conversations, activeConversationId]);
    
    const startNewConversation = () => {
        const newId = Date.now().toString();
        const newConversation: Conversation = {
            id: newId,
            name: `Conversation ${conversations.length + 1}`,
            messages: [initialConversation.messages[0]],
            createdAt: new Date().toISOString()
        };
        const newConversations = [newConversation, ...conversations];
        setConversations(newConversations);
        setActiveConversationId(newId);
    };

    const handleAddMessage = (message: Message) => {
        if (!activeConversationId) return;
        setConversations(prev => prev.map(conv => {
            if (conv.id === activeConversationId) {
                const newMessages = [...conv.messages, message];
                if (conv.messages.length === 1 && conv.messages[0].id === 'initial' && message.role === 'user') {
                    // This is the first user message in a new chat.
                    // Set conversation name from the first 4 words of the message.
                    const newName = message.content.split(' ').slice(0, 4).join(' ');
                    return { ...conv, name: newName, messages: newMessages };
                }
                return { ...conv, messages: newMessages };
            }
            return conv;
        }));
    };

    const handleMessageDelete = (messageId: string) => {
        if (!activeConversationId) return;

        setConversations(prev => prev.map(conv => {
            if (conv.id === activeConversationId) {
                // Prevent deleting the initial welcome message
                if (messageId === 'initial') return conv;
                return { ...conv, messages: conv.messages.filter(m => m.id !== messageId) };
            }
            return conv;
        }));
    };
    
    const handleClearConversation = (conversationId: string) => {
        setConversations(prev => prev.map(conv => {
            if (conv.id === conversationId) {
                return { ...conv, messages: [initialConversation.messages[0]] };
            }
            return conv;
        }));
    };
    
    const handleDeleteConversation = (conversationId: string) => {
        setConversations(prev => {
            const newConversations = prev.filter(c => c.id !== conversationId);
            if (activeConversationId === conversationId) {
                if (newConversations.length > 0) {
                    setActiveConversationId(newConversations[0].id);
                } else {
                    startNewConversation();
                    // Since startNewConversation prepends, the activeId is set to the new one,
                    // but we need to return an empty array and let the effect handle creating a new one if it's the last one.
                    // Let's adjust logic.
                     setActiveConversationId(null);
                }
            }
            if (newConversations.length === 0) {
                startNewConversation();
                return []; // will be repopulated by startNewConversation's effect
            }
            return newConversations;
        });
    };
    
    const handleRenameConversation = (conversationId: string) => {
        if (!editingName.trim()) {
            setEditingConversationId(null);
            return;
        };
        setConversations(prev => prev.map(conv => {
            if (conv.id === conversationId) {
                return { ...conv, name: editingName };
            }
            return conv;
        }));
        setEditingConversationId(null);
        setEditingName('');
    };

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    return (
        <div className="flex h-screen w-full animated-gradient">
            <Sidebar>
                <SidebarHeader>
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={startNewConversation}>
                        <PlusCircle className="h-4 w-4" />
                        New Chat
                    </Button>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {conversations.map(conv => (
                            <SidebarMenuItem key={conv.id}>
                                {editingConversationId === conv.id ? (
                                    <div className="flex w-full items-center gap-1 p-1">
                                        <Input 
                                            value={editingName} 
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleRenameConversation(conv.id)}
                                            onBlur={() => handleRenameConversation(conv.id)}
                                            autoFocus
                                            className="h-7"
                                        />
                                    </div>
                                ) : (
                                    <SidebarMenuButton 
                                        asChild
                                        isActive={conv.id === activeConversationId}
                                        tooltip={conv.name}
                                        className="justify-between"
                                    >
                                        <div onClick={() => setActiveConversationId(conv.id)}>
                                            <div className="flex items-center gap-2 truncate">
                                                <MessageSquare />
                                                <span className="truncate">{conv.name}</span>
                                            </div>
                                            <div className="flex items-center opacity-0 group-hover/menu-item:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setEditingConversationId(conv.id); setEditingName(conv.name); }}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.id)}}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </SidebarMenuButton>
                                )}
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>

            <div className="flex-1 flex flex-col">
                {activeConversation ? (
                    <ChatInterface
                        key={activeConversation.id}
                        conversation={activeConversation}
                        onMessageAdd={handleAddMessage}
                        onConversationClear={handleClearConversation}
                        onMessageDelete={handleMessageDelete}
                    />
                ) : (
                    <div className="flex flex-1 items-center justify-center">
                        <div className="text-center">
                            <WormGPTSolidLogo className="mx-auto h-12 w-12" />
                            <p className="mt-2 text-lg">Select a conversation or start a new one.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

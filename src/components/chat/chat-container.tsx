'use client';
import { useState, useEffect } from 'react';
import type { Conversation, Message } from '@/lib/types';
import { ChatInterface } from './chat-interface';
import { Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '../ui/sidebar';
import { Button } from '../ui/button';
import { PlusCircle, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { Input } from '../ui/input';

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
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversationId(newId);
    };

    const handleAddMessage = (message: Message) => {
        if (!activeConversationId) return;
        setConversations(prev => prev.map(conv => {
            if (conv.id === activeConversationId) {
                return { ...conv, messages: [...conv.messages, message] };
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
                setActiveConversationId(newConversations.length > 0 ? newConversations[0].id : null);
            }
            if (newConversations.length === 0) {
                startNewConversation();
            }
            return newConversations;
        });
    };
    
    const handleRenameConversation = (conversationId: string) => {
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
            <Sidebar collapsible="icon">
                <SidebarHeader>
                    {/* The trigger is now in the ChatInterface header */}
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
                                        onClick={() => setActiveConversationId(conv.id)} 
                                        isActive={conv.id === activeConversationId}
                                        tooltip={conv.name}
                                    >
                                        <MessageSquare />
                                        <span>{conv.name}</span>
                                    </SidebarMenuButton>
                                )}
                                <div className="absolute right-1 top-1.5 flex items-center">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingConversationId(conv.id); setEditingName(conv.name); }}>
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteConversation(conv.id)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={startNewConversation}>
                        <PlusCircle className="h-4 w-4" />
                        New Chat
                    </Button>
                </SidebarFooter>
            </Sidebar>

            <div className="flex-1 flex flex-col">
                {activeConversation ? (
                    <ChatInterface
                        key={activeConversation.id}
                        conversation={activeConversation}
                        onMessageAdd={handleAddMessage}
                        onConversationClear={handleClearConversation}
                    />
                ) : (
                    <div className="flex flex-1 items-center justify-center">
                        <p>Select a conversation or start a new one.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

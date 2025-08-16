
'use client';
import { useState, useEffect } from 'react';
import type { Conversation, Message } from '@/lib/types';
import { ChatInterface } from './chat-interface';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '../ui/sidebar';
import { Button } from '../ui/button';
import { PlusCircle, MessageSquare, Edit, Trash2, Settings } from 'lucide-react';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { SettingsDialog } from '../settings/settings-dialog';
import type { getVeniceResponse as getVeniceResponseType, getImageAnalysis as getImageAnalysisType } from '@/app/actions';

const initialConversation: Conversation = {
    id: '1',
    name: 'New Conversation',
    messages: [],
    createdAt: new Date().toISOString()
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface ChatContainerProps {
    getVeniceResponse: typeof getVeniceResponseType;
    getImageAnalysis: typeof getImageAnalysisType;
}

export function ChatContainer({ getVeniceResponse, getImageAnalysis }: ChatContainerProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [lastMessageIsNew, setLastMessageIsNew] = useState(false);


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
        } else {
            localStorage.removeItem('conversations');
        }
        if(activeConversationId) {
            localStorage.setItem('activeConversationId', activeConversationId);
        } else {
            localStorage.removeItem('activeConversationId');
        }
    }, [conversations, activeConversationId]);
    
    const startNewConversation = () => {
        const newId = Date.now().toString();
        const newConversation: Conversation = {
            id: newId,
            name: `WormGPT`,
            messages: [],
            createdAt: new Date().toISOString()
        };
        const newConversations = [newConversation, ...conversations];
        setConversations(newConversations);
        setActiveConversationId(newId);
    };

    const handleAddMessage = (message: Message, isNew: boolean) => {
        if (!activeConversationId) return;
        setConversations(prev => prev.map(conv => {
            if (conv.id === activeConversationId) {
                const newMessages = [...conv.messages, message];
                return { ...conv, messages: newMessages, createdAt: new Date().toISOString() };
            }
            return conv;
        }));
        setLastMessageIsNew(isNew);
    };

    const handleUpdateMessage = (messageId: string, newContent: string) => {
        if (!activeConversationId) return;
        setConversations(prev => prev.map(conv => {
            if (conv.id === activeConversationId) {
                return { 
                    ...conv, 
                    messages: conv.messages.map(m => 
                        m.id === messageId ? { ...m, content: newContent } : m
                    ) 
                };
            }
            return conv;
        }));
    };

    const handleMessageDelete = (messageId: string) => {
        if (!activeConversationId) return;

        setConversations(prev => prev.map(conv => {
            if (conv.id === activeConversationId) {
                if (messageId === 'initial') return conv;
                return { ...conv, messages: conv.messages.filter(m => m.id !== messageId) };
            }
            return conv;
        }));
    };
    
    const handleClearConversation = (conversationId: string) => {
        setConversations(prev => prev.map(conv => {
            if (conv.id === conversationId) {
                return { ...conv, messages: [] };
            }
            return conv;
        }));
    };
    
    const handleDeleteConversation = (conversationId: string) => {
        const newConversations = conversations.filter(c => c.id !== conversationId);
    
        if (newConversations.length === 0) {
            const newId = Date.now().toString();
            const newConversation: Conversation = {
                id: newId,
                name: `WormGPT`,
                messages: [],
                createdAt: new Date().toISOString()
            };
            setConversations([newConversation]);
            setActiveConversationId(newId);
        } else {
            setConversations(newConversations);
            if (activeConversationId === conversationId) {
                setActiveConversationId(newConversations[0].id);
            }
        }
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

    const sortedConversations = [...conversations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="flex h-screen w-full bg-background">
             <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
            <Sidebar>
                <SidebarHeader className="p-3">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                             <h2 className="text-lg font-semibold">WormGPT</h2>
                         </div>
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={startNewConversation}>
                            <PlusCircle />
                        </Button>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <div className="px-3 py-2">
                        <Button variant="outline" className="w-full mb-4" onClick={startNewConversation}>
                            <PlusCircle className="mr-2" />
                            New Chat
                        </Button>

                        <h3 className="mb-2 px-1 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                            Chat History
                        </h3>
                        <SidebarMenu>
                            {sortedConversations.map(conv => (
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
                                        <div className="relative group">
                                            <SidebarMenuButton 
                                                isActive={conv.id === activeConversationId}
                                                tooltip={conv.name}
                                                className="justify-between h-auto py-2 w-full"
                                                onClick={() => setActiveConversationId(conv.id)}
                                            >
                                                <div className="flex items-center gap-2 w-full truncate">
                                                    <MessageSquare className="h-4 w-4" />
                                                    <span className="truncate font-medium flex-1">{conv.name}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{formatDate(conv.createdAt)}</span>
                                            </SidebarMenuButton>
                                            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setEditingConversationId(conv.id); setEditingName(conv.name); }}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-400" onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.id)}}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </div>
                </SidebarContent>
                <SidebarFooter className="p-3 border-t border-sidebar-border">
                     <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={() => setIsSettingsOpen(true)}>
                                <Settings />
                                Settings
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                             <div className="flex items-center gap-2 p-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>G</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">Gwyn Literatus</span>
                            </div>
                        </SidebarMenuItem>
                     </SidebarMenu>
                </SidebarFooter>
            </Sidebar>

            <div className="flex-1 flex flex-col">
                {activeConversation ? (
                    <ChatInterface
                        key={activeConversation.id}
                        conversation={activeConversation}
                        onMessageAdd={handleAddMessage}
                        onMessageUpdate={handleUpdateMessage}
                        onConversationClear={handleClearConversation}
                        onMessageDelete={handleMessageDelete}
                        getVeniceResponse={getVeniceResponse}
                        getImageAnalysis={getImageAnalysis}
                        lastMessageIsNew={lastMessageIsNew}
                    />
                ) : (
                    <div className="flex flex-1 items-center justify-center">
                        <div className="text-center">
                            <p className="mt-2 text-lg">Select a conversation or start a new one.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

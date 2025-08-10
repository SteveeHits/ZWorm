'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettings, type Voice } from '@/context/settings-context';
import { Check, Palette, Mic, Maximize, CheckCircle, Droplets, Sparkles, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const themes = [
    { name: 'violet', color: 'hsl(262.1 83.3% 57.8%)' },
    { name: 'zinc', color: 'hsl(240 5.9% 50%)' },
    { name: 'slate', color: 'hsl(215.2 79.2% 51.2%)' },
    { name: 'stone', color: 'hsl(25 5.3% 44.7%)' },
    { name: 'gray', color: 'hsl(220 8.9% 46.1%)' },
    { name: 'neutral', color: 'hsl(0 0% 45.1%)' },
    { name: 'red', color: 'hsl(0 72.2% 50.6%)' },
    { name: 'rose', color: 'hsl(346.8 77.2% 49.8%)' },
    { name: 'orange', color: 'hsl(24.6 95% 53.1%)' },
    { name: 'green', color: 'hsl(142.1 76.2% 36.3%)' },
    { name: 'blue', color: 'hsl(221.2 83.2% 53.3%)' },
    { name: 'yellow', color: 'hsl(47.9 95.8% 53.1%)' },
] as const;

const voices: { name: Voice, label: string }[] = [
    { name: 'Algenib', label: 'Algenib (Male)' },
    { name: 'Achernar', label: 'Achernar (Male)'},
    { name: 'Spica', label: 'Spica (Female)' },
    { name: 'Antares', label: 'Antares (Male)' },
    { name: 'Arcturus', label: 'Arcturus (Male)' },
    { name: 'Canopus', label: 'Canopus (Male)' }
];

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const { settings, setSettings, toggleFullscreen } = useSettings();
    const [localSettings, setLocalSettings] = useState(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings, open]);

    const handleApply = () => {
        setSettings(localSettings);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Customize your experience. Changes will be applied when you click Apply.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-4">
                    <div className="space-y-8 py-4">
                        
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium flex items-center gap-2"><Palette className="h-5 w-5" /> Appearance</h3>
                            
                            <div className='space-y-2'>
                                <Label>Primary Color</Label>
                                <div className="grid grid-cols-6 gap-2">
                                    {themes.map(theme => (
                                        <Button
                                            key={theme.name}
                                            variant="outline"
                                            size="icon"
                                            className={cn("h-10 w-10 rounded-full", localSettings.theme === theme.name && "ring-2 ring-primary ring-offset-2 ring-offset-background")}
                                            style={{ backgroundColor: theme.color }}
                                            onClick={() => setLocalSettings(s => ({ ...s, theme: theme.name }))}
                                            aria-label={`Select ${theme.name} theme`}
                                        >
                                            {localSettings.theme === theme.name && <Check className="h-5 w-5 text-white" />}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className='space-y-2'>
                                <Label>Background Color</Label>
                                <Input type="color" value={localSettings.backgroundColor} onChange={(e) => setLocalSettings(s => ({...s, backgroundColor: e.target.value}))} className="w-full" />
                            </div>

                            <div className='space-y-2'>
                                <Label>Text Color</Label>
                                <Input type="color" value={localSettings.textColor} onChange={(e) => setLocalSettings(s => ({...s, textColor: e.target.value}))} className="w-full" />
                            </div>

                        </div>
                        
                        <div className="space-y-4">
                             <h3 className="text-lg font-medium flex items-center gap-2"><Droplets className="h-5 w-5" /> Background Gradient</h3>
                             <div className="flex items-center justify-between rounded-lg border p-3">
                                <Label htmlFor="gradient-mode">Enable Gradient</Label>
                                <Switch id="gradient-mode" checked={localSettings.useGradient} onCheckedChange={(checked) => setLocalSettings(s => ({ ...s, useGradient: checked }))} />
                            </div>
                            {localSettings.useGradient && (
                                <div className="grid grid-cols-2 gap-4 rounded-lg border p-3">
                                    <div className="flex flex-col gap-1">
                                        <Label htmlFor="gradient-from" className="text-xs">From</Label>
                                        <Input id="gradient-from" type="color" value={localSettings.gradientFrom} onChange={(e) => setLocalSettings(s => ({ ...s, gradientFrom: e.target.value }))} className="h-10 w-full" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label htmlFor="gradient-to" className="text-xs">To</Label>
                                        <Input id="gradient-to" type="color" value={localSettings.gradientTo} onChange={(e) => setLocalSettings(s => ({ ...s, gradientTo: e.target.value }))} className="h-10 w-full" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium flex items-center gap-2"><Sparkles className="h-5 w-5" /> Animation</h3>
                            <Select value={localSettings.animation} onValueChange={(value) => setLocalSettings(s => ({...s, animation: value as any}))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select animation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="wave">Wave</SelectItem>
                                    <SelectItem value="glow">Glow</SelectItem>
                                    <SelectItem value="pulse">Pulse</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium flex items-center gap-2"><Mic className="h-5 w-5" /> Voice Settings</h3>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <Label htmlFor="voice-mode">Enable Voice</Label>
                                <Switch id="voice-mode" checked={localSettings.voiceMode} onCheckedChange={(checked) => setLocalSettings(s => ({...s, voiceMode: checked}))} />
                            </div>

                            {localSettings.voiceMode && (
                                <div className='space-y-2'>
                                    <Label>Voice Selection</Label>
                                    <Select value={localSettings.voice} onValueChange={(value) => setLocalSettings(s => ({...s, voice: value as Voice}))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a voice" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {voices.map(voice => (
                                                <SelectItem key={voice.name} value={voice.name}>{voice.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        
                         <div className="space-y-4">
                             <h3 className="text-lg font-medium flex items-center gap-2"><SlidersHorizontal className="h-5 w-5" /> General</h3>
                             <div className="flex items-center justify-between rounded-lg border p-3">
                                <Label htmlFor="fullscreen-mode" className="flex items-center gap-2"><Maximize className="h-5 w-5" /> Full Screen</Label>
                                <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                                    {settings.fullscreen ? 'Exit' : 'Enter'} Full Screen
                                </Button>
                            </div>
                        </div>

                    </div>
                </ScrollArea>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleApply}>Apply Changes</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}


'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/context/settings-context';
import { Palette, Maximize, SlidersHorizontal, Mic, Waves } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const themes = [
    { name: 'default', label: 'Default' },
    { name: 'theme-red', label: 'Red' },
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
                            <div className="space-y-2">
                                <Label>Theme</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {themes.map((theme) => (
                                        <Button
                                            key={theme.name}
                                            variant={localSettings.theme === theme.name ? 'default' : 'outline'}
                                            onClick={() => setLocalSettings(s => ({ ...s, theme: theme.name }))}
                                        >
                                            {theme.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                             <div className="flex items-center justify-between rounded-lg border p-3">
                                <Label htmlFor="bg-animations" className="flex items-center gap-2"><Waves className="h-5 w-5" /> Background Animations</Label>
                                <Switch
                                    id="bg-animations"
                                    checked={localSettings.backgroundAnimationsEnabled}
                                    onCheckedChange={(checked) => setLocalSettings(s => ({...s, backgroundAnimationsEnabled: checked}))}
                                />
                            </div>
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

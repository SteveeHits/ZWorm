'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Battery, Plug, Clock, Calendar } from 'lucide-react';

export function ChatInfoPanel() {
  const [batteryStatus, setBatteryStatus] = useState({ level: 0, charging: false });
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const updateDateTime = () => setDateTime(new Date());
    const timer = setInterval(updateDateTime, 1000);

    let battery: any;
    const updateBatteryStatus = async () => {
      try {
        if ('getBattery' in navigator) {
          battery = await (navigator as any).getBattery();
          const update = () => {
            setBatteryStatus({
              level: Math.floor(battery.level * 100),
              charging: battery.charging,
            });
          };
          update();
          battery.addEventListener('levelchange', update);
          battery.addEventListener('chargingchange', update);
        }
      } catch (error) {
        console.error('Battery status not available:', error);
      }
    };

    updateBatteryStatus();

    return () => {
      clearInterval(timer);
      if (battery) {
        battery.removeEventListener('levelchange', () => {});
        battery.removeEventListener('chargingchange', () => {});
      }
    };
  }, []);

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle>Device Info</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <span>{dateTime.toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <span>{dateTime.toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Battery className="h-5 w-5 text-primary" />
          <span>{batteryStatus.level}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-primary" />
          <span>{batteryStatus.charging ? 'Yes' : 'No'}</span>
        </div>
      </CardContent>
    </Card>
  );
}


import { ChatContainer } from '@/components/chat/chat-container';
import { getVeniceResponse } from './actions';

export default function Home() {
  return <ChatContainer getVeniceResponse={getVeniceResponse} />;
}

    

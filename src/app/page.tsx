
import { ChatContainer } from '@/components/chat/chat-container';
import { getVeniceResponse, getImageAnalysis } from './actions';

export default function Home() {
  return <ChatContainer getVeniceResponse={getVeniceResponse} getImageAnalysis={getImageAnalysis} />;
}

    

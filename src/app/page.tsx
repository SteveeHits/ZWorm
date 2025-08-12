
import { ChatContainer } from '@/components/chat/chat-container';
import { getVeniceResponse, getFileAnalysis } from './actions';

export default function Home() {
  return <ChatContainer getVeniceResponse={getVeniceResponse} getFileAnalysis={getFileAnalysis} />;
}

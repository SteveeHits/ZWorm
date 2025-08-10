import { config } from 'dotenv';
config();

import '@/ai/flows/initial-prompt.ts';
import '@/ai/flows/tts-flow.ts';
import '@/ai/flows/venice-flow.ts';

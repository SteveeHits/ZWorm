
'use server';
/**
 * @fileOverview A flow for analyzing uploaded files using a generative AI model.
 *
 * - analyzeFileFlow - A function that takes file data and returns an analysis.
 * - AnalyzeFileInput - The input type for the analyzeFileFlow function.
 * - AnalyzeFileOutput - The return type for the analyzeFileFlow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeFileInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A file represented as a data URI, including a MIME type and Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
   fileName: z.string().describe('The name of the file.'),
});
export type AnalyzeFileInput = z.infer<typeof AnalyzeFileInputSchema>;

const AnalyzeFileOutputSchema = z.object({
  description: z.string().describe('The extracted raw text content from the file. If no text is found, this should be an empty string.'),
  fileType: z.string().describe("The identified type of the file (e.g., 'image', 'text', 'code', 'unknown')."),
});
export type AnalyzeFileOutput = z.infer<typeof AnalyzeFileOutputSchema>;


const analysisPrompt = ai.definePrompt({
    name: 'fileAnalysisPrompt',
    input: { schema: AnalyzeFileInputSchema },
    output: { schema: AnalyzeFileOutputSchema },
    prompt: `You are an expert file analyst. Your task is to analyze the provided file, determine its type, and extract all text content from it.

Follow these steps:
1.  **Determine the fileType**: Based on the file extension ('{{{fileName}}}') and content, classify it as one of: 'image', 'text', 'code', or 'unknown'.
2.  **Extract Text**:
    *   If the file is an 'image', perform OCR to extract all visible text. If no text is present, return an empty string for the description.
    *   If the file is 'text' or 'code', extract the raw text content.
    *   If the file is 'unknown' or you cannot extract text, return an empty string for the description.
3.  **Return JSON**: Your output must be a valid JSON object matching the required schema, containing both 'fileType' and 'description'.

File to analyze:
{{media url=fileDataUri}}
`,
});


export const analyzeFileFlow = ai.defineFlow(
  {
    name: 'analyzeFileFlow',
    inputSchema: AnalyzeFileInputSchema,
    outputSchema: AnalyzeFileOutputSchema,
  },
  async (input) => {
    const { output } = await analysisPrompt(input);
    return output!;
  }
);

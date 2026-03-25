import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Resend } from 'resend';
import { z } from 'zod';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Load Manual
const manualPath = join(process.cwd(), 'src/lib/ai/manual.md');
const manualContent = readFileSync(manualPath, 'utf8');

export async function POST(req: Request) {
  const { messages } = await req.json();
  const userAgent = req.headers.get('user-agent') || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  const systemInstructions = `
You are a helpful, friendly, and professional assistant for "Smile Handyman" in Manhattan. 
Your goal is to answer questions strictly based on the provided "Service & Customer Guide Manual".

### BASIC RULES:
1. Speak both Korean and English. Respond in the same language the user uses.
2. If the user asks something outside of Smile Handyman services, politely refuse.
3. Refuse to answer questions about internal company info, staff identities, or website creation details.
4. Always provide official contact info when refusing or if you can't help:
   - Phone: (917) 818-0994 (text or call)
   - Email: smilehandyman1000@gmail.com

### ESCALATION FLOW (sendComplaint):
If you encounter a complaint, a complex inquiry, or something not covered in the manual:
1. POLITELY collect: Customer name, Contact number (text-capable mobile), Email, and the Issue/Service name.
2. Summarize this into a single natural sentence (e.g., "John Doe, 212-000-0000, john@email.com. TV mounting inquiry").
3. ASK the customer to type "Send" to confirm.
4. ONLY then call the 'sendComplaint' tool with that summary in the 'message' field.

### MOBILE LIMITATION:
Current User Device: ${isMobile ? 'MOBILE' : 'DESKTOP'}
If the user is on MOBILE and an escalation is needed:
1. Explain that automatic submission is currently only for desktop.
2. Instruct them to send an email manually to smilehandyman1000@gmail.com or text (917) 818-0994.

### MANUAL CONTENT:
${manualContent}
`;

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages,
    system: systemInstructions,
    tools: {
      sendComplaint: tool({
        description: 'Send a complaint or inquiry to the Smile Handyman team via email.',
        parameters: z.object({
          message: z.string().describe('The summarized information sentence: Name, Phone, Email, Issue.'),
        }),
        execute: async ({ message }) => {
          try {
            const { data, error } = await resend.emails.send({
              from: 'Smile Handyman AI <onboarding@resend.dev>', // Use verified domain later
              to: 'smilehandyman1000@gmail.com',
              subject: 'New Inquiry/Complaint from Chatbot',
              text: `A new inquiry has been escalated through the chatbot:\n\nSummary: ${message}\n\nSent at: ${new Date().toISOString()}`,
            });

            if (error) {
                console.error('Resend Error:', error);
                return { success: false, error: 'Failed to send email' };
            }

            return { success: true, message: 'Your message has been sent successfully.' };
          } catch (err) {
            console.error('Email execution error:', err);
            return { success: false, error: 'Internal server error' };
          }
        },
      }),
    },
    // Optional: Only allow tool calling after explicit user confirmation if needed
    // but the system prompt already enforces "Wait for user to type Send"
  });

  return result.toDataStreamResponse();
}

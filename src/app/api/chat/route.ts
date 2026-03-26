import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Resend } from 'resend';
import { z } from 'zod';

// Load Manual at module level (static file - safe)
const manualPath = join(process.cwd(), 'src/lib/ai/manual.md');
const manualContent = readFileSync(manualPath, 'utf8');

export async function POST(req: Request) {
  const { messages } = await req.json();

  const systemInstructions = `
You are a helpful, friendly, and professional assistant for "Smile Handyman" in Manhattan. 
Your goal is to answer questions strictly based on the provided "Service & Customer Guide Manual".

### BASIC RULES:
1. LANGUAGE RULE (STRICT): Always respond in the SAME language the user wrote in.
   - If the user writes in English → respond ONLY in English.
   - If the user writes in Korean → respond ONLY in Korean.
   - NEVER mix languages or provide translations unless explicitly asked.
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
5. AFTER the tool runs, check the result:
   - If success: true → Tell the user clearly: "✅ Your message has been sent successfully! Our team will contact you soon."
   - If success: false → Tell the user: "❌ Sorry, there was an error sending your message. Please contact us directly at (917) 818-0994 or smilehandyman1000@gmail.com."

### MANUAL CONTENT:
${manualContent}
`;

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages,
    system: systemInstructions,
    maxSteps: 3,
    tools: {
      sendComplaint: tool({
        description: 'Send a complaint or inquiry to the Smile Handyman team via email.',
        parameters: z.object({
          message: z.string().describe('The summarized information: Name, Phone, Email, Issue.'),
        }),
        execute: async ({ message }) => {
          try {
            // Initialize Resend lazily inside handler to avoid build-time errors
            const resend = new Resend(process.env.RESEND_API_KEY);
            const { error } = await resend.emails.send({
              from: 'Smile Handyman AI <onboarding@resend.dev>',
              to: 'multizer@live.com',
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
  });

  return result.toDataStreamResponse();
}


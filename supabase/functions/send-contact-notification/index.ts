/**
 * Edge function: send-contact-notification
 * Sends email notification when a new contact form submission is received
 * Triggered via database webhook or direct call
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Email notification recipient
const NOTIFICATION_EMAIL = "contact@horalix.com";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

interface WebhookPayload {
  type: "INSERT";
  table: string;
  record: ContactSubmission;
  schema: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the webhook payload
    const payload: WebhookPayload = await req.json();

    // Validate payload
    if (payload.type !== "INSERT" || payload.table !== "contact_submissions") {
      return new Response(
        JSON.stringify({ message: "Invalid webhook payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const submission = payload.record;

    // Use Lovable AI to generate a professional email summary
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: "You are a professional email assistant. Generate a brief, professional summary of the contact form submission for internal team notification. Keep it concise - 2-3 sentences max."
          },
          {
            role: "user",
            content: `Summarize this contact form submission:\nName: ${submission.name}\nEmail: ${submission.email}\nMessage: ${submission.message}`
          }
        ],
        max_tokens: 150,
      }),
    });

    let aiSummary = "Unable to generate summary.";
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      aiSummary = aiData.choices?.[0]?.message?.content || aiSummary;
    }

    // Log the notification (in production, integrate with email service like Resend)
    console.log("=== NEW CONTACT FORM SUBMISSION ===");
    console.log(`ID: ${submission.id}`);
    console.log(`From: ${submission.name} <${submission.email}>`);
    console.log(`Received: ${submission.created_at}`);
    console.log(`Message: ${submission.message}`);
    console.log(`AI Summary: ${aiSummary}`);
    console.log("===================================");

    // For now, we'll return success and log the notification
    // To send actual emails, integrate with Resend, SendGrid, or similar
    // Example Resend integration:
    // const resendApiKey = Deno.env.get("RESEND_API_KEY");
    // if (resendApiKey) {
    //   await fetch("https://api.resend.com/emails", {
    //     method: "POST",
    //     headers: {
    //       "Authorization": `Bearer ${resendApiKey}`,
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       from: "Horalix <noreply@horalix.com>",
    //       to: [NOTIFICATION_EMAIL],
    //       subject: `New Contact: ${submission.name}`,
    //       html: `<h2>New Contact Form Submission</h2>
    //         <p><strong>From:</strong> ${submission.name} (${submission.email})</p>
    //         <p><strong>Message:</strong></p>
    //         <p>${submission.message}</p>
    //         <p><strong>AI Summary:</strong> ${aiSummary}</p>`,
    //     }),
    //   });
    // }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification processed",
        submission_id: submission.id,
        summary: aiSummary
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error processing contact notification:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process notification" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

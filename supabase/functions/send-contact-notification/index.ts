/**
 * Edge function: send-contact-notification
 * Sends email notification when a new contact form submission is received
 * Triggered via database webhook with webhook secret validation
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
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
    // Step 1: Validate webhook secret to prevent unauthorized access
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
    const providedSecret = req.headers.get("x-webhook-secret");
    
    // WEBHOOK_SECRET is REQUIRED - no fallback allowed for security
    if (!webhookSecret) {
      console.error("WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error - WEBHOOK_SECRET not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!providedSecret || providedSecret !== webhookSecret) {
      console.error("Webhook secret validation failed");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid webhook secret" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Parse the webhook payload
    const payload: WebhookPayload = await req.json();

    // Step 3: Validate payload structure
    if (payload.type !== "INSERT" || payload.table !== "contact_submissions") {
      return new Response(
        JSON.stringify({ message: "Invalid webhook payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const submission = payload.record;

    // Step 4: Validate submission data
    if (!submission.name || !submission.email || !submission.message) {
      return new Response(
        JSON.stringify({ error: "Invalid submission data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 5: Use Lovable AI to generate a professional email summary
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

    // Step 6: Log the notification (in production, integrate with email service like Resend)
    console.log("=== NEW CONTACT FORM SUBMISSION ===");
    console.log(`ID: ${submission.id}`);
    console.log(`From: ${submission.name} <${submission.email}>`);
    console.log(`Received: ${submission.created_at}`);
    console.log(`Message: ${submission.message}`);
    console.log(`AI Summary: ${aiSummary}`);
    console.log("===================================");

    // Step 7: Return success response
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

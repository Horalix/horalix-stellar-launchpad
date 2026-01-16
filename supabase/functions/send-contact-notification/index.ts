/**
 * Edge function: send-contact-notification
 * Sends email notification to all admins when a new contact form submission is received
 * Triggered via database webhook with webhook secret validation
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Step 1: CORS headers for cross-origin requests

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

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
    // Step 2: Validate webhook secret to prevent unauthorized access
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
    const providedSecret = req.headers.get("x-webhook-secret");
    
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

    // Step 3: Parse the webhook payload
    const payload: WebhookPayload = await req.json();

    // Step 4: Validate payload structure
    if (payload.type !== "INSERT" || payload.table !== "contact_submissions") {
      return new Response(
        JSON.stringify({ message: "Invalid webhook payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const submission = payload.record;

    // Step 5: Validate submission data
    if (!submission.name || !submission.email || !submission.message) {
      return new Response(
        JSON.stringify({ error: "Invalid submission data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 6: Initialize Supabase client to fetch admin emails
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 7: Fetch all admin email addresses from user_roles + profiles
    const { data: adminProfiles, error: adminError } = await supabase
      .from("user_roles")
      .select(`
        user_id,
        profiles!inner(email)
      `)
      .eq("role", "admin");

    if (adminError) {
      console.error("Error fetching admin emails:", adminError);
    }

    // Step 8: Extract admin emails
    const adminEmails: string[] = adminProfiles
      ?.filter((admin: any) => admin.profiles?.email)
      .map((admin: any) => admin.profiles.email) || [];

    console.log(`Found ${adminEmails.length} admin(s) to notify`);

    // Step 9: Use Lovable AI to generate a professional email summary
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

    // Step 10: Format submission date
    const submittedDate = new Date(submission.created_at).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Step 11: Create email HTML content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00D4FF, #00B4E6); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .summary { background: #e8f4f8; padding: 15px; border-left: 4px solid #00D4FF; margin: 15px 0; border-radius: 0 4px 4px 0; }
          .message-box { background: white; padding: 15px; border: 1px solid #ddd; border-radius: 4px; margin: 15px 0; }
          .detail { margin: 10px 0; }
          .label { font-weight: 600; color: #555; }
          .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
          .btn { display: inline-block; background: #00D4FF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">New Contact Inquiry</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Horalix Contact Form</p>
          </div>
          <div class="content">
            <div class="summary">
              <strong>AI Summary:</strong><br/>
              ${aiSummary}
            </div>
            
            <div class="detail">
              <span class="label">From:</span> ${submission.name}
            </div>
            <div class="detail">
              <span class="label">Email:</span> <a href="mailto:${submission.email}">${submission.email}</a>
            </div>
            <div class="detail">
              <span class="label">Received:</span> ${submittedDate}
            </div>
            
            <div class="message-box">
              <span class="label">Full Message:</span>
              <p style="white-space: pre-wrap;">${submission.message}</p>
            </div>
            
            <a href="https://horalix.com/admin/contacts" class="btn">View in Admin Panel</a>
          </div>
          <div class="footer">
            <p>This is an automated notification from Horalix.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Step 12: Send email to all admins via Resend REST API
    if (adminEmails.length > 0) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Horalix <notifications@horalix.com>",
            to: adminEmails,
            subject: `New Contact Inquiry from ${submission.name}`,
            html: emailHtml,
          }),
        });

        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          console.log("Email sent successfully to admins:", emailData);
        } else {
          const errorData = await emailResponse.json();
          console.error("Resend API error:", errorData);
        }
      } catch (emailError: any) {
        console.error("Error sending email:", emailError);
        // Don't fail the webhook if email fails - log and continue
      }
    } else {
      console.warn("No admin emails found - skipping email notification");
    }

    // Step 13: Log the notification for monitoring
    console.log("=== NEW CONTACT FORM SUBMISSION ===");
    console.log(`ID: ${submission.id}`);
    console.log(`From: ${submission.name} <${submission.email}>`);
    console.log(`Received: ${submission.created_at}`);
    console.log(`Message: ${submission.message}`);
    console.log(`AI Summary: ${aiSummary}`);
    console.log(`Notified admins: ${adminEmails.join(", ") || "none"}`);
    console.log("===================================");

    // Step 14: Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification processed",
        submission_id: submission.id,
        summary: aiSummary,
        admins_notified: adminEmails.length
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

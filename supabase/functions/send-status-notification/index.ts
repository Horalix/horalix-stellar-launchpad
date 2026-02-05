/**
 * Edge function: send-status-notification
 * Sends email notification to users when their submission status changes
 * Requires JWT authentication and admin role
 */

import { createClient } from "npm:@supabase/supabase-js@2";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusNotificationRequest {
  submission_id: string;
  user_email: string;
  user_name: string;
  new_status: string;
  original_message?: string;
}

// Status-specific messaging
const STATUS_MESSAGES: Record<string, { subject: string; heading: string; body: string }> = {
  in_progress: {
    subject: "We're Reviewing Your Inquiry",
    heading: "Your Message is Being Reviewed",
    body: "Our team has received your message and is currently reviewing it. We'll get back to you as soon as possible with a response.",
  },
  responded: {
    subject: "We've Responded to Your Inquiry",
    heading: "Response Ready",
    body: "Great news! Our team has reviewed your inquiry and prepared a response. Please check your email for our detailed reply, or log in to view your submission status.",
  },
  archived: {
    subject: "Your Inquiry Has Been Closed",
    heading: "Inquiry Closed",
    body: "Your inquiry has been marked as complete and archived. If you have any further questions, feel free to submit a new inquiry through our contact form.",
  },
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 1: Get authorization token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Initialize Supabase clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    // Step 3: Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 4: Verify user has admin or editor role
    const { data: roleData, error: roleError } = await supabaseService
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "editor"])
      .single();

    if (roleError || !roleData) {
      console.error("Role check failed:", roleError);
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 5: Parse request body
    const requestData: StatusNotificationRequest = await req.json();
    const { submission_id, user_email, user_name, new_status, original_message } = requestData;

    // Step 6: Validate required fields
    if (!submission_id || !user_email || !user_name || !new_status) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 7: Get status-specific messaging
    const statusMessage = STATUS_MESSAGES[new_status];
    if (!statusMessage) {
      console.log(`No notification configured for status: ${new_status}`);
      return new Response(
        JSON.stringify({ success: true, message: "No notification sent for this status" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 8: Create email HTML content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .header .logo { color: #00D4FF; font-weight: bold; font-size: 28px; margin-bottom: 10px; }
          .content { background: #f9f9f9; padding: 30px 20px; }
          .greeting { font-size: 18px; margin-bottom: 20px; }
          .status-box { background: white; border-left: 4px solid #00D4FF; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .status-heading { font-size: 20px; font-weight: 600; color: #1a1a2e; margin: 0 0 10px 0; }
          .status-body { color: #555; margin: 0; }
          .original-message { background: #e8e8e8; padding: 15px; border-radius: 4px; margin: 20px 0; font-style: italic; color: #666; }
          .original-label { font-weight: 600; font-style: normal; color: #333; margin-bottom: 5px; }
          .footer { background: #1a1a2e; color: #888; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
          .footer a { color: #00D4FF; text-decoration: none; }
          .btn { display: inline-block; background: #00D4FF; color: #1a1a2e !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">HORALIX</div>
            <h1>${statusMessage.subject}</h1>
          </div>
          <div class="content">
            <p class="greeting">Hi ${user_name},</p>
            
            <div class="status-box">
              <h2 class="status-heading">${statusMessage.heading}</h2>
              <p class="status-body">${statusMessage.body}</p>
            </div>
            
            ${original_message ? `
              <div class="original-message">
                <p class="original-label">Your Original Inquiry:</p>
                <p>${original_message.substring(0, 200)}${original_message.length > 200 ? '...' : ''}</p>
              </div>
            ` : ''}
            
            <a href="https://horalix.com/profile/submissions" class="btn">View Your Submissions</a>
          </div>
          <div class="footer">
            <p>Thank you for contacting Horalix.</p>
            <p><a href="https://horalix.com">horalix.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Step 9: Send email to user via Resend
    try {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Horalix <notifications@horalix.com>",
          to: [user_email],
          subject: `Horalix: ${statusMessage.subject}`,
          html: emailHtml,
        }),
      });

      if (emailResponse.ok) {
        const emailData = await emailResponse.json();
        console.log("Status notification email sent:", emailData);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Notification sent",
            email_id: emailData.id
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        const errorData = await emailResponse.json();
        console.error("Resend API error:", errorData);
        return new Response(
          JSON.stringify({ error: "Failed to send notification email", details: errorData }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (emailError: any) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send notification email", details: emailError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    console.error("Error in send-status-notification:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

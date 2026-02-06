/**
 * Edge function: send-status-notification
 * Sends email to user when their contact submission status changes
 * Called from admin ContactsManager with JWT auth
 */

import { createClient } from "npm:@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Step 1: Helper to build JSON responses
function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Step 2: Status-specific messaging
const STATUS_MESSAGES: Record<
  string,
  { subject: string; heading: string; body: string }
> = {
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
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 3: Validate required secrets
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFrom =
      Deno.env.get("RESEND_FROM") || "Horalix <notifications@horalix.com>";
    const siteUrl = Deno.env.get("SITE_URL") || "https://horalix.com";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!resendApiKey) {
      return jsonResponse({ error: "RESEND_API_KEY not configured" }, 500);
    }
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      return jsonResponse(
        { error: "Supabase credentials not configured" },
        500
      );
    }

    // Step 4: Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization header" }, 401);
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    // Step 5: Verify admin/editor role
    const { data: roleData } = await supabaseService
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "editor"])
      .single();

    if (!roleData) {
      return jsonResponse(
        { error: "Forbidden - Admin access required" },
        403
      );
    }

    // Step 6: Parse request body
    const { submission_id, new_status } = await req.json();

    if (!submission_id || !new_status) {
      return jsonResponse(
        { error: "submission_id and new_status are required" },
        400
      );
    }

    // Step 7: Fetch submission from database
    const { data: submission, error: fetchError } = await supabaseService
      .from("contact_submissions")
      .select("*")
      .eq("id", submission_id)
      .single();

    if (fetchError || !submission) {
      console.error("Submission not found:", fetchError);
      return jsonResponse({ error: "Submission not found" }, 404);
    }

    // Step 8: Get status-specific messaging
    const statusMessage = STATUS_MESSAGES[new_status];
    if (!statusMessage) {
      return jsonResponse(
        { ok: true, message: `No notification configured for status: ${new_status}` },
        200
      );
    }

    // Step 9: Build and send email
    const emailHtml = `<!DOCTYPE html><html><head><style>
      body{font-family:'Segoe UI',sans-serif;line-height:1.6;color:#333;margin:0;padding:0}
      .container{max-width:600px;margin:0 auto;padding:20px}
      .header{background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;padding:30px 20px;border-radius:8px 8px 0 0;text-align:center}
      .header .logo{color:#00D4FF;font-weight:bold;font-size:28px;margin-bottom:10px}
      .content{background:#f9f9f9;padding:30px 20px}
      .status-box{background:#fff;border-left:4px solid #00D4FF;padding:20px;margin:20px 0;border-radius:0 8px 8px 0;box-shadow:0 2px 4px rgba(0,0,0,.1)}
      .status-heading{font-size:20px;font-weight:600;color:#1a1a2e;margin:0 0 10px}
      .original-message{background:#e8e8e8;padding:15px;border-radius:4px;margin:20px 0;font-style:italic;color:#666}
      .btn{display:inline-block;background:#00D4FF;color:#1a1a2e!important;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;margin-top:20px}
      .footer{background:#1a1a2e;color:#888;padding:20px;text-align:center;border-radius:0 0 8px 8px;font-size:12px}
      .footer a{color:#00D4FF;text-decoration:none}
    </style></head><body><div class="container">
      <div class="header"><div class="logo">HORALIX</div><h1 style="margin:0;font-size:20px">${statusMessage.subject}</h1></div>
      <div class="content">
        <p style="font-size:18px">Hi ${submission.name},</p>
        <div class="status-box"><h2 class="status-heading">${statusMessage.heading}</h2><p style="color:#555;margin:0">${statusMessage.body}</p></div>
        ${submission.message ? `<div class="original-message"><p style="font-weight:600;font-style:normal;color:#333;margin-bottom:5px">Your Original Inquiry:</p><p>${submission.message.substring(0, 200)}${submission.message.length > 200 ? "..." : ""}</p></div>` : ""}
        <a href="${siteUrl}/profile/submissions" class="btn">View Your Submissions</a>
      </div>
      <div class="footer"><p>Thank you for contacting Horalix.</p><p><a href="${siteUrl}">horalix.com</a></p></div>
    </div></body></html>`;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [submission.email],
        subject: `Horalix: ${statusMessage.subject}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Resend API error:", errorData);
      return jsonResponse(
        { error: "Failed to send notification email", details: errorData },
        500
      );
    }

    const emailData = await emailResponse.json();
    console.log(`Status notification sent to ${submission.email}:`, emailData);

    return jsonResponse({
      ok: true,
      message: "Notification sent",
      email_id: emailData.id,
    });
  } catch (error) {
    console.error("Error in send-status-notification:", error);
    return jsonResponse(
      { error: "Internal server error", details: String(error) },
      500
    );
  }
});

/**
 * Edge function: send-contact-notification
 * Sends email notification to team + confirmation to user after contact form submission
 * Called directly from frontend after insert, requires JWT auth
 */

import { createClient } from "npm:@supabase/supabase-js@2";

// CORS headers for cross-origin requests
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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 2: Validate required secrets
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFrom = Deno.env.get("RESEND_FROM") || "Horalix <notifications@horalix.com>";
    const siteUrl = Deno.env.get("SITE_URL") || "https://horalix.com";
    const teamEmailsRaw = Deno.env.get("TEAM_NOTIFICATION_EMAILS") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return jsonResponse({ error: "RESEND_API_KEY not configured" }, 500);
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials not configured");
      return jsonResponse({ error: "Supabase credentials not configured" }, 500);
    }

    // Step 3: Parse team emails
    const teamEmails = teamEmailsRaw
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    if (teamEmails.length === 0) {
      console.error("TEAM_NOTIFICATION_EMAILS is empty");
      return jsonResponse({ error: "No team emails configured" }, 500);
    }

    // Step 4: Parse request body
    const { submission_id } = await req.json();
    if (!submission_id) {
      return jsonResponse({ error: "submission_id is required" }, 400);
    }

    // Step 5: Fetch submission from database
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: submission, error: fetchError } = await supabase
      .from("contact_submissions")
      .select("*")
      .eq("id", submission_id)
      .single();

    if (fetchError || !submission) {
      console.error("Submission not found:", fetchError);
      return jsonResponse({ error: "Submission not found" }, 404);
    }

    // Step 6: Format date for emails
    const submittedDate = new Date(submission.created_at).toLocaleString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    // Step 7: Send team notification email
    const teamHtml = `<!DOCTYPE html><html><head><style>
      body{font-family:'Segoe UI',sans-serif;line-height:1.6;color:#333}
      .container{max-width:600px;margin:0 auto;padding:20px}
      .header{background:linear-gradient(135deg,#00D4FF,#00B4E6);color:#fff;padding:20px;border-radius:8px 8px 0 0}
      .content{background:#f9f9f9;padding:20px;border-radius:0 0 8px 8px}
      .detail{margin:10px 0}.label{font-weight:600;color:#555}
      .message-box{background:#fff;padding:15px;border:1px solid #ddd;border-radius:4px;margin:15px 0}
      .btn{display:inline-block;background:#00D4FF;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;margin-top:15px}
    </style></head><body><div class="container">
      <div class="header"><h1 style="margin:0">New Contact Inquiry</h1><p style="margin:5px 0 0;opacity:.9">Horalix Contact Form</p></div>
      <div class="content">
        <div class="detail"><span class="label">From:</span> ${submission.name}</div>
        <div class="detail"><span class="label">Email:</span> <a href="mailto:${submission.email}">${submission.email}</a></div>
        <div class="detail"><span class="label">Received:</span> ${submittedDate}</div>
        <div class="message-box"><span class="label">Message:</span><p style="white-space:pre-wrap">${submission.message}</p></div>
        <a href="${siteUrl}/admin/contacts" class="btn">View in Admin Panel</a>
      </div>
    </div></body></html>`;

    let teamSent = false;
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFrom,
          to: teamEmails,
          subject: `New Contact Inquiry from ${submission.name}`,
          html: teamHtml,
        }),
      });
      teamSent = res.ok;
      if (!res.ok) {
        const err = await res.json();
        console.error("Resend team error:", err);
      }
    } catch (e) {
      console.error("Team email error:", e);
    }

    // Step 8: Send user confirmation email
    const userHtml = `<!DOCTYPE html><html><head><style>
      body{font-family:'Segoe UI',sans-serif;line-height:1.6;color:#333;margin:0;padding:0}
      .container{max-width:600px;margin:0 auto;padding:20px}
      .header{background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;padding:30px 20px;border-radius:8px 8px 0 0;text-align:center}
      .header .logo{color:#00D4FF;font-weight:bold;font-size:28px;margin-bottom:10px}
      .content{background:#f9f9f9;padding:30px 20px}
      .footer{background:#1a1a2e;color:#888;padding:20px;text-align:center;border-radius:0 0 8px 8px;font-size:12px}
      .footer a{color:#00D4FF;text-decoration:none}
    </style></head><body><div class="container">
      <div class="header"><div class="logo">HORALIX</div><h1 style="margin:0;font-size:20px">We Received Your Message</h1></div>
      <div class="content">
        <p>Hi ${submission.name},</p>
        <p>Thank you for reaching out to Horalix. We've received your inquiry and our team will review it shortly.</p>
        <p>You'll receive an update once we've reviewed your message. You can also track the status of your inquiry by logging in to your account.</p>
      </div>
      <div class="footer"><p>Thank you for contacting Horalix.</p><p><a href="${siteUrl}">horalix.com</a></p></div>
    </div></body></html>`;

    let userSent = false;
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [submission.email],
          subject: "Horalix: We Received Your Message",
          html: userHtml,
        }),
      });
      userSent = res.ok;
      if (!res.ok) {
        const err = await res.json();
        console.error("Resend user error:", err);
      }
    } catch (e) {
      console.error("User email error:", e);
    }

    // Step 9: Return explicit result
    console.log(
      `Contact notification: team=${teamSent}, user=${userSent}, id=${submission_id}`
    );

    return jsonResponse({
      ok: true,
      team_notified: teamSent,
      user_notified: userSent,
      submission_id,
    });
  } catch (error) {
    console.error("Error in send-contact-notification:", error);
    return jsonResponse(
      { error: "Failed to process notification", details: String(error) },
      500
    );
  }
});

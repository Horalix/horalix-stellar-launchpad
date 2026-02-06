/**
 * Edge function: send-contact-notification
 * Sends email notification to team and confirmation to user after contact form submission
 */

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFrom =
      Deno.env.get("RESEND_FROM") || "Horalix <notifications@horalix.com>";
    const siteUrl = Deno.env.get("SITE_URL") || "https://horalix.com";
    const teamEmailsRaw = Deno.env.get("TEAM_NOTIFICATION_EMAILS") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!resendApiKey) {
      return jsonResponse({ error: "RESEND_API_KEY not configured" }, 500);
    }
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return jsonResponse({ error: "Supabase credentials not configured" }, 500);
    }

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

    const teamEmails = teamEmailsRaw
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (teamEmails.length === 0) {
      return jsonResponse({ error: "No team emails configured" }, 500);
    }

    const { submission_id } = await req.json();
    if (!submission_id) {
      return jsonResponse({ error: "submission_id is required" }, 400);
    }

    const { data: submission, error: fetchError } = await supabaseService
      .from("contact_submissions")
      .select("*")
      .eq("id", submission_id)
      .single();

    if (fetchError || !submission) {
      return jsonResponse({ error: "Submission not found" }, 404);
    }

    const { data: roleData, error: roleError } = await supabaseService
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "editor"])
      .limit(1)
      .maybeSingle();

    if (roleError) {
      return jsonResponse({ error: "Unable to verify role" }, 500);
    }

    const isAdminOrEditor = !!roleData;
    const isOwner = submission.user_id === user.id;

    if (!isAdminOrEditor && !isOwner) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

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
      const teamResponse = await fetch("https://api.resend.com/emails", {
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
      teamSent = teamResponse.ok;
    } catch (teamError) {
      console.error("Team notification error:", teamError);
    }

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
        <p>Thank you for reaching out to Horalix. We received your inquiry and our team will review it shortly.</p>
        <p>You will receive an update once we review your message. You can also track your inquiry status by logging in.</p>
      </div>
      <div class="footer"><p>Thank you for contacting Horalix.</p><p><a href="${siteUrl}">horalix.com</a></p></div>
    </div></body></html>`;

    let userSent = false;
    try {
      const userResponse = await fetch("https://api.resend.com/emails", {
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
      userSent = userResponse.ok;
    } catch (userError) {
      console.error("User confirmation error:", userError);
    }

    if (!teamSent || !userSent) {
      return jsonResponse(
        {
          error: "One or more notifications failed",
          team_notified: teamSent,
          user_notified: userSent,
          submission_id,
        },
        500
      );
    }

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

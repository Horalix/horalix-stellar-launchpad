/**
 * Edge function: send-newsletter
 * Sends newsletter email to all subscribed users when a new article is published
 * Includes idempotency check to prevent duplicate sends
 */

import { createClient } from "npm:@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://horalix.com";

interface NewsletterRequest {
  article_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 1: Verify admin authorization
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

    // Step 3: Verify user is authenticated and is admin
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: roleData } = await supabaseService
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "editor"])
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 4: Parse request body
    const { article_id }: NewsletterRequest = await req.json();
    if (!article_id) {
      return new Response(
        JSON.stringify({ error: "article_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 5: Check idempotency - has this article already been sent?
    const { data: existingSend } = await supabaseService
      .from("newsletter_sends")
      .select("id")
      .eq("article_id", article_id)
      .single();

    if (existingSend) {
      return new Response(
        JSON.stringify({ success: true, message: "Newsletter already sent for this article", skipped: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 6: Fetch the article
    const { data: article, error: articleError } = await supabaseService
      .from("news_articles")
      .select("*")
      .eq("id", article_id)
      .eq("is_published", true)
      .single();

    if (articleError || !article) {
      return new Response(
        JSON.stringify({ error: "Article not found or not published" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 7: Fetch all active subscribers
    const { data: subscribers, error: subError } = await supabaseService
      .from("newsletter_subscriptions")
      .select("email")
      .eq("is_subscribed", true);

    if (subError) {
      console.error("Error fetching subscribers:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscribers" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      await supabaseService.from("newsletter_sends").insert({
        article_id: article_id,
        recipients_count: 0,
      });

      return new Response(
        JSON.stringify({ success: true, message: "No subscribers to notify", recipients: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 8: Prepare email content
    const articleUrl = `${SITE_URL}/news/${article.slug}`;
    const imageUrl = article.image_urls?.[0] || "";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; padding: 30px 20px; text-align: center; }
          .header .logo { color: #00D4FF; font-weight: bold; font-size: 28px; margin-bottom: 10px; }
          .content { background: white; padding: 30px 20px; }
          .article-card { border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
          .article-image { width: 100%; height: 200px; object-fit: cover; }
          .article-body { padding: 20px; }
          .article-title { font-size: 22px; font-weight: 600; color: #1a1a2e; margin: 0 0 10px 0; }
          .article-summary { color: #666; margin: 0 0 20px 0; }
          .btn { display: inline-block; background: #00D4FF; color: #1a1a2e !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
          .footer { background: #1a1a2e; color: #888; padding: 20px; text-align: center; font-size: 12px; }
          .footer a { color: #00D4FF; text-decoration: none; }
          .unsubscribe { margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">HORALIX</div>
            <p style="margin: 0; opacity: 0.9;">New Article Published</p>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>We've just published a new article that we think you'll find interesting:</p>
            
            <div class="article-card">
              ${imageUrl ? `<img src="${imageUrl}" alt="${article.title}" class="article-image" />` : ''}
              <div class="article-body">
                <h2 class="article-title">${article.title}</h2>
                <p class="article-summary">${article.summary}</p>
                <a href="${articleUrl}" class="btn">Read Full Article</a>
              </div>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for being part of the Horalix community.</p>
            <p><a href="${SITE_URL}">horalix.com</a></p>
            <p class="unsubscribe">
              <a href="${SITE_URL}/unsubscribe?email={{EMAIL}}">Unsubscribe from newsletter</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Step 9: Send emails via Resend
    const recipientEmails = subscribers.map((s) => s.email);
    let successCount = 0;
    let failCount = 0;

    const batchSize = 50;
    for (let i = 0; i < recipientEmails.length; i += batchSize) {
      const batch = recipientEmails.slice(i, i + batchSize);
      
      for (const email of batch) {
        const personalizedHtml = emailHtml.replace(/{{EMAIL}}/g, encodeURIComponent(email));
        
        try {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Horalix <newsletter@horalix.com>",
              to: [email],
              subject: `New from Horalix: ${article.title}`,
              html: personalizedHtml,
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            failCount++;
            const errorData = await response.json();
            console.error(`Failed to send to ${email}:`, errorData);
          }
        } catch (emailError) {
          failCount++;
          console.error(`Error sending to ${email}:`, emailError);
        }
      }
    }

    // Step 10: Record the send for idempotency
    await supabaseService.from("newsletter_sends").insert({
      article_id: article_id,
      recipients_count: successCount,
    });

    console.log(`Newsletter sent: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Newsletter sent to ${successCount} subscribers`,
        recipients: successCount,
        failed: failCount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-newsletter:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

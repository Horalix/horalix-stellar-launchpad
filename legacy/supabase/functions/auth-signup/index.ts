/**
 * Edge function: auth-signup
 * Proxies signup through an origin-checked edge function so the cloned frontend
 * on an unauthorized domain cannot register users against production.
 */

import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorsHeaders, rejectUnknownOrigin } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const originBlock = rejectUnknownOrigin(req);
  if (originBlock) return originBlock;

  try {
    const { email, password, fullName, newsletterOptIn, emailRedirectTo } =
      await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const siteUrl = Deno.env.get("SITE_URL") || "https://horalix.com";

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Force the redirect URL to the canonical domain regardless of what the
    // client sends — prevents redirect hijacking.
    const safeRedirect = emailRedirectTo?.startsWith(siteUrl)
      ? emailRedirectTo
      : `${siteUrl}/verify-email`;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: safeRedirect,
        data: {
          full_name: fullName?.trim() ?? "",
          newsletter_opt_in: !!newsletterOptIn,
        },
      },
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ user: data.user, session: data.session }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

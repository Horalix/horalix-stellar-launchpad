/**
 * Edge function: newsletter-unsubscribe
 * Handles newsletter unsubscribe requests from email links
 */

import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorsHeaders, rejectUnknownOrigin } from "../_shared/cors.ts";

interface UnsubscribeRequest {
  email: string;
  token?: string;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const originBlock = rejectUnknownOrigin(req);
  if (originBlock) return originBlock;

  try {
    // Step 1: Parse request body
    const { email, token }: UnsubscribeRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Initialize Supabase service client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 3: Find and update subscription
    const { data: subscription, error: fetchError } = await supabase
      .from("newsletter_subscriptions")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (fetchError || !subscription) {
      console.log("Subscription not found for email:", email);
      // Return success anyway to prevent email enumeration
      return new Response(
        JSON.stringify({ success: true, message: "Unsubscribed successfully" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 4: Update subscription status
    const { error: updateError } = await supabase
      .from("newsletter_subscriptions")
      .update({
        is_subscribed: false,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("email", email.toLowerCase());

    if (updateError) {
      console.error("Error updating subscription:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to unsubscribe" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully unsubscribed: ${email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Unsubscribed successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in newsletter-unsubscribe:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { createClient } from "npm:@supabase/supabase-js@2.90.1";

import {
  getCorsHeaders,
  rejectUnknownOrigin,
} from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  const originBlock = rejectUnknownOrigin(req);

  if (originBlock) {
    return originBlock;
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: "Missing authorization header",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get(
      "SUPABASE_ANON_KEY",
    );
    const supabaseServiceRoleKey = Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY",
    );
    const netlifyBuildHookUrl = Deno.env.get(
      "NETLIFY_BUILD_HOOK_URL",
    );

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !supabaseServiceRoleKey
    ) {
      throw new Error(
        "Required Supabase environment variables are missing",
      );
    }

    if (!netlifyBuildHookUrl) {
      return new Response(
        JSON.stringify({
          error:
            "NETLIFY_BUILD_HOOK_URL is not configured",
        }),
        {
          status: 503,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const authenticatedClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      },
    );

    const serviceClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
    );

    const {
      data: { user },
      error: userError,
    } = await authenticatedClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const { data: roleData, error: roleError } =
      await serviceClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "editor"])
        .limit(1)
        .maybeSingle();

    if (roleError) {
      throw roleError;
    }

    if (!roleData) {
      return new Response(
        JSON.stringify({
          error: "Forbidden",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const netlifyResponse = await fetch(
      netlifyBuildHookUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trigger_title: "Horalix news CMS update",
        }),
      },
    );

    if (!netlifyResponse.ok) {
      throw new Error(
        `Netlify build hook returned HTTP ${netlifyResponse.status}`,
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Netlify deployment triggered",
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";

    console.error(
      "Failed to trigger Netlify deployment:",
      error,
    );

    return new Response(
      JSON.stringify({
        error: message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
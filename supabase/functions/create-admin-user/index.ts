/**
 * Edge Function: create-admin-user
 * Securely creates an admin user with credentials from environment secrets
 * This function requires admin setup key authentication for security
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Step 1: CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-setup-key",
};

Deno.serve(async (req) => {
  // Step 2: Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 3: Validate admin setup key for security
    const adminSetupKey = Deno.env.get("ADMIN_SETUP_KEY");
    const providedKey = req.headers.get("x-admin-setup-key");
    
    // Admin setup key is REQUIRED for this endpoint
    if (!adminSetupKey) {
      console.error("ADMIN_SETUP_KEY not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Admin setup not configured. Please configure ADMIN_SETUP_KEY secret.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    if (!providedKey || providedKey !== adminSetupKey) {
      console.error("Admin setup key validation failed");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized - Invalid admin setup key",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Step 4: Get credentials from environment secrets
    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");

    if (!adminEmail || !adminPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Admin credentials not configured in secrets",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Step 5: Create Supabase admin client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Step 6: Check if admin already exists
    const { data: existingUsers, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      throw listError;
    }

    const existingAdmin = existingUsers.users.find(
      (u) => u.email === adminEmail
    );

    if (existingAdmin) {
      // Step 7a: Check if user already has admin role
      const { data: existingRole } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", existingAdmin.id)
        .eq("role", "admin")
        .maybeSingle();

      if (existingRole) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "Admin user already exists with admin role",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      // Step 7b: Add admin role to existing user
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: existingAdmin.id, role: "admin" });

      if (roleError) {
        throw roleError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Admin role added to existing user",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Step 8: Create new admin user
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
      });

    if (createError) {
      throw createError;
    }

    // Step 9: Assign admin role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUser.user.id, role: "admin" });

    if (roleError) {
      throw roleError;
    }

    // Step 10: Return success response (without exposing sensitive data)
    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin user created successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201,
      }
    );
  } catch (error: any) {
    console.error("Error creating admin user:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to create admin user",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

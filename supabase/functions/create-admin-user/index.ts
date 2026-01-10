/**
 * Edge Function: create-admin-user
 * Securely creates an admin user with credentials from environment secrets
 * This function should only be called once to set up the initial admin
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Step 1: CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Step 2: Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 3: Get credentials from environment secrets
    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");

    if (!adminEmail || !adminPassword) {
      throw new Error("Admin credentials not configured in secrets");
    }

    // Step 4: Create Supabase admin client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Step 5: Check if admin already exists
    const { data: existingUsers, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      throw listError;
    }

    const existingAdmin = existingUsers.users.find(
      (u) => u.email === adminEmail
    );

    if (existingAdmin) {
      // Step 6a: Check if user already has admin role
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
            email: adminEmail,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      // Step 6b: Add admin role to existing user
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
          email: adminEmail,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Step 7: Create new admin user
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true, // Auto-confirm the email
      });

    if (createError) {
      throw createError;
    }

    // Step 8: Assign admin role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUser.user.id, role: "admin" });

    if (roleError) {
      throw roleError;
    }

    // Step 9: Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin user created successfully",
        email: adminEmail,
        userId: newUser.user.id,
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
        error: error.message || "Failed to create admin user",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

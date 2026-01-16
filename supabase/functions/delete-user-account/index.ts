import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * delete-user-account - Edge function to delete a user's account
 * Requires authenticated user, uses service role to delete auth user
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 1: Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Create client with user's token to verify identity
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Step 3: Verify the user is authenticated
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 4: Create admin client to delete user
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Step 5: Delete user's data from related tables first (cascading should handle most)
    // Delete profile
    await adminClient.from("profiles").delete().eq("user_id", user.id);
    
    // Delete user roles
    await adminClient.from("user_roles").delete().eq("user_id", user.id);
    
    // Delete contact submissions
    await adminClient.from("contact_submissions").delete().eq("user_id", user.id);

    // Step 6: Delete user's storage files
    try {
      const { data: avatarFiles } = await adminClient.storage
        .from("user-avatars")
        .list(user.id);
      
      if (avatarFiles && avatarFiles.length > 0) {
        const filePaths = avatarFiles.map((f) => `${user.id}/${f.name}`);
        await adminClient.storage.from("user-avatars").remove(filePaths);
      }
    } catch (storageError) {
      console.error("Storage cleanup error (non-fatal):", storageError);
    }

    // Step 7: Delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return new Response(
        JSON.stringify({ error: "Failed to delete account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 8: Return success
    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

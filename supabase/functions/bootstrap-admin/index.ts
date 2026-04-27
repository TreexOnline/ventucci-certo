// One-time bootstrap to create the initial admin account.
// Safe to call multiple times: it's a no-op if any admin already exists.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const adminEmail = Deno.env.get("BOOTSTRAP_ADMIN_EMAIL");
    const adminPassword = Deno.env.get("BOOTSTRAP_ADMIN_PASSWORD");
    if (!adminEmail || !adminPassword || adminPassword.length < 12) {
      return new Response(JSON.stringify({ ok: false, error: "bootstrap_not_configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Abort if any admin already exists.
    const { data: existing, error: roleErr } = await admin
      .from("user_roles")
      .select("id")
      .eq("role", "admin")
      .limit(1);

    if (roleErr) throw roleErr;
    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ ok: true, message: "Admin já existe. Nada a fazer." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Create the auth user.
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });
    if (createErr) throw createErr;

    const userId = created.user!.id;
    const { error: insertErr } = await admin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (insertErr) throw insertErr;

    return new Response(
      JSON.stringify({ ok: true, message: "Admin criado com sucesso.", userId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("bootstrap-admin error:", msg);
    return new Response(JSON.stringify({ ok: false, error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

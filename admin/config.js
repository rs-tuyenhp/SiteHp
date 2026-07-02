/* ==========================================================================
   Supabase configuration (shared by editor + preview screens)
   --------------------------------------------------------------------------
   NOTE: The publishable key is designed to be used in the browser — it is
   safe to expose. Access is controlled by your Row Level Security (RLS)
   policies on the `templates` table (SELECT + UPDATE are currently open).
   If you later lock RLS down, add an authenticated policy for updates.
   ========================================================================== */
window.NEXORA_SUPABASE = {
  url: "https://lbgremrhdrfomdoknhdu.supabase.co",
  key: "sb_publishable__xmwEP_ZOaxR3bM94NTkKA_ptXTpVDv",
  table: "templates",
  id: 1, // row id to read/patch
};

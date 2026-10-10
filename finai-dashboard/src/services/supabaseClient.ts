/**
 * Supabase client shared by the whole dashboard.
 * Only browser-safe values (project URL + publishable key) are used here;
 * row level security in the database decides what each user can read or write.
 */
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

export const supabase = createClient(
	supabaseUrl || "https://local-development.supabase.co",
	supabaseKey || "local-development-placeholder",
	{
	auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true,
	},
	},
)

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uofjcoialctfosiqjqdq.supabase.co";

const supabaseKey = "sb_publishable_sMf0kXANVtll90zAScsPtQ_2Pqvtw6R";

export const supabase = createClient(supabaseUrl, supabaseKey);
export { serve } from "https://deno.land/std@0.168.0/http/server.ts"
export { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

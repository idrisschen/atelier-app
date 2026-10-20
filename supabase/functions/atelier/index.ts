// Point d'entrée Supabase Edge Function (et `deno run` en local) : toute la logique est dans handler.ts.
import { handler } from './handler.ts';

Deno.serve(handler);

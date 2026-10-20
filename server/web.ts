// Démo web : sert l'app exportée (`npx expo export -p web` → dist/) et la passerelle IA sur /api.
// Lancement : deno run --allow-net --allow-env --allow-read --config server/deno.json server/web.ts
import { serveDir } from '@std/http/file-server';

import { handler } from '../supabase/functions/atelier/handler.ts';

const ROOT = Deno.env.get('ATELIER_DIST') ?? 'dist';
const PORT = Number(Deno.env.get('PORT') ?? 8000);

Deno.serve({ port: PORT }, async (req) => {
  const { pathname } = new URL(req.url);
  if (pathname === '/api') return handler(req);
  if (pathname === '/healthz') return new Response('ok');

  const res = await serveDir(req, { fsRoot: ROOT, quiet: true });
  // Routes de l'app (/tournage, /objectif…) : l'export est une page unique, on renvoie index.html.
  if (res.status === 404 && req.method === 'GET' && !pathname.includes('.')) {
    return serveDir(new Request(new URL('/', req.url), req), { fsRoot: ROOT, quiet: true });
  }
  return res;
});

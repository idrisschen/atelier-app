# Démo web de l'app : export Expo web + serveur Deno (pages + passerelle IA sur /api).
FROM node:22.23.4-bookworm-slim AS web
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ENV EXPO_PUBLIC_AI_URL=/api
RUN npx expo export -p web --output-dir dist

FROM denoland/deno:2.5.6
WORKDIR /app
COPY server ./server
COPY supabase/functions/atelier ./supabase/functions/atelier
RUN deno cache --config server/deno.json server/web.ts
COPY --from=web /app/dist ./dist
USER deno
ENV PORT=8000
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD deno eval "const r = await fetch('http://127.0.0.1:8000/healthz'); if (!r.ok) Deno.exit(1)"
CMD ["run", "--allow-net", "--allow-env", "--allow-read", "--config", "server/deno.json", "server/web.ts"]

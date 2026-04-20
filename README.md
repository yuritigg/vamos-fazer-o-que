# Vamos Fazer O Que?

Portal de divulgação de eventos regionais com Next.js 14, Tailwind CSS, shadcn/ui, Supabase Auth, Cloudinary e Resend.

## Supabase conectado no projeto

As credenciais já estão configuradas em `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Criar tabelas e RLS no Supabase

1. Acesse o painel do Supabase.
2. Abra `SQL Editor`.
3. Execute o conteúdo de `supabase/schema.sql`.

Esse script cria:

- `users`
- `organizers`
- `events`
- `event_images`
- `event_attractions`
- `reviews`
- `saved_events`
- `notifications`

Também ativa RLS em todas as tabelas e cria políticas para:

- usuários acessarem seus próprios dados
- organizadores gerenciarem apenas seus eventos
- admins moderarem conteúdo
- público ver apenas eventos aprovados

## Configurar autenticação (Email/Senha e Google)

No painel Supabase:

1. `Authentication` > `Providers`:
   - habilite `Email`
   - habilite `Google`
2. Em `Google`, configure as credenciais OAuth.
3. Defina o Redirect URL:
   - `http://localhost:3000/api/auth/callback`

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

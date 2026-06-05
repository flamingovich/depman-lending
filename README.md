# DepMan — Telegram Mini App каталог партнёров

Мобильный лендинг в стиле [kolxozapp.com](https://kolxozapp.com/) для партнёрских проектов с бонусами и встроенной админ-панелью.

## Стек

- **Next.js 16** — фронт и API
- **Prisma 7 + SQLite** — база (легко перенести на Postgres)
- **Tailwind CSS 4** — UI
- **Telegram Web App SDK** — интеграция Mini App

## Быстрый старт

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

- Mini App: http://localhost:3000
- Админка: http://localhost:3000/admin

### Доступ в админку (после seed)

- Email: `admin@depman.local`
- Пароль: `admin123`

Смените `ADMIN_EMAIL`, `ADMIN_PASSWORD` и `ADMIN_JWT_SECRET` в `.env` перед продакшеном.

## Админ-панель

Собственная панель на `/admin` (вдохновлена open-source CMS вроде [Payload](https://github.com/payloadcms/payload), но заточена под ваш кейс):

- **Проекты** — название, slug, бонусы, промокод, партнёрская ссылка, featured-карточка
- **Настройки** — тексты шапки, поиска, нижней панели, ссылка на Telegram-бота

## Telegram Mini App

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. В BotFather: `/newapp` → укажите URL вашего деплоя (например `https://your-domain.vercel.app`)
3. В админке укажите ссылку на бота в «Ссылка на бота»
4. Партнёрские ссылки открываются через `Telegram.WebApp.openLink()`

## Деплой (Vercel)

1. Подключите репозиторий к Vercel
2. Добавьте переменные из `.env.example`
3. Для продакшена лучше **Postgres** + `@prisma/adapter-pg` вместо SQLite
4. Запустите `npm run db:seed` один раз (или через CI)

## Структура

```
src/app/              — Mini App и страницы партнёров
src/app/admin/        — админ-панель
src/app/api/          — REST API для админки
prisma/               — схема и seed
```

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер |
| `npm run build` | Сборка |
| `npm run db:seed` | Демо-данные |
| `npm run db:studio` | Prisma Studio |

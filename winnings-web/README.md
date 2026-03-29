This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Newsletter Subscription Provider Setup

The footer subscribe form posts to `POST /api/subscribe`.

By default it stores emails in local CSV only (`SUBSCRIBE_PROVIDER=local`).

To send real campaigns, set one provider in your environment:

- `SUBSCRIBE_PROVIDER=buttondown`
  - `BUTTONDOWN_API_KEY`
- `SUBSCRIBE_PROVIDER=convertkit`
  - `CONVERTKIT_API_KEY`
  - `CONVERTKIT_FORM_ID`
- `SUBSCRIBE_PROVIDER=mailerlite`
  - `MAILERLITE_API_KEY`
  - `MAILERLITE_GROUP_ID` (optional)

Example local env file (`.env.local`):

```env
SUBSCRIBE_PROVIDER=buttondown
BUTTONDOWN_API_KEY=your_buttondown_api_key
```

On Vercel, add the same variables in **Project Settings → Environment Variables**.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

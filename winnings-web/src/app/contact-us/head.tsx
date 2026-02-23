export default function Head() {
  const title = "Contact WinningsAura";
  const description =
    "Contact the WinningsAura team for feedback, data requests, and partnership inquiries.";
  const url = "https://winnings-aura.vercel.app/contact-us";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
    </>
  );
}

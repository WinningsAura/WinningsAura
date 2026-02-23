export default function Head() {
  const title = "Tennis Prize Money Stats | WinningsAura";
  const description =
    "Explore tennis prize money, tournament payouts, and player winnings in one streamlined dashboard.";
  const url = "https://winnings-aura.vercel.app/tennis-stats";

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

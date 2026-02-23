export default function Head() {
  const title = "Cricket Prize Money & Stats | WinningsAura";
  const description =
    "Discover cricket prize money insights, tournament-level payouts, and stats designed for quick comparisons.";
  const url = "https://winnings-aura.vercel.app/cricket-stats";

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

export default function Head() {
  const title = "Golf Prize Money Dashboard | WinningsAura";
  const description =
    "View golf prize money and event payout stats with easy-to-scan visuals and leaderboard-friendly data.";
  const url = "https://winnings-aura.vercel.app/golf-stats";

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

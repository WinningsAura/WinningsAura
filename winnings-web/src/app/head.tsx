export default function Head() {
  const title = "WinningsAura | Tennis, Cricket & Golf Prize Money Insights";
  const description =
    "Track prize money trends across tennis, cricket, and golf with fast, clean dashboards built for sports fans and data-driven users.";
  const url = "https://winnings-aura.vercel.app/";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="tennis prize money, cricket prize money, golf prize money, sports stats, winnings aura" />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
    </>
  );
}

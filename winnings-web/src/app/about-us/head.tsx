export default function Head() {
  const title = "About WinningsAura";
  const description =
    "Learn about WinningsAura and how we organize tennis, cricket, and golf winnings data for sports fans.";
  const url = "https://winnings-aura.vercel.app/about-us";

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

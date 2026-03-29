export default function Head() {
  const title = "Submit Sports Prize Structure Data | WinningsAura";
  const description =
    "Submit tournament prize money details for Tennis, Cricket, Golf, Chess, Badminton, and Soccer. Help keep WinningsAura data current.";
  const url = "https://winningsaura.com/submit-prize-structure";

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

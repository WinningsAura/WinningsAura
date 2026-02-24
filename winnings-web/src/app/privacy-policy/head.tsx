export default function Head() {
  const title = "Privacy Policy";
  const description = "Read the WinningsAura Privacy Policy to understand how data is collected and used.";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href="https://winnings-aura.vercel.app/privacy-policy" />
    </>
  );
}

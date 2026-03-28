export default function Head() {
  const title = "Terms and Conditions";
  const description = "Read WinningsAura Terms and Conditions for website use, data disclaimers, and content rights.";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href="https://winningsaura.com/terms-and-conditions" />
    </>
  );
}

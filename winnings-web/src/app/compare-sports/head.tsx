export default function Head() {
  const title = "Compare Sports Prize Money | Tennis, Cricket, Golf, Chess, Soccer";
  const description =
    "Compare winner and runner-up prize money across Tennis, Cricket, Golf, Chess, Badminton, and Soccer with a fast visual dashboard.";
  const url = "https://winningsaura.com/compare-sports";

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

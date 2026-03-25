const LOCAL_BASE = process.env.LOCAL_BASE || 'http://127.0.0.1:3000';
const VERCEL_BASE = process.env.VERCEL_BASE || 'https://winnings-aura.vercel.app';
const SHEETS = ['Badminton', 'Cricket', 'Golf', 'Chess', 'Soccer'];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkUrl(url, label, { retries = 1, retryDelayMs = 1000 } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (!res.ok) {
        throw new Error(`${label} returned HTTP ${res.status}`);
      }
      const text = await res.text();
      console.log(`${label}: OK (HTTP ${res.status}, len=${text.length})`);
      return { ok: true, status: res.status, len: text.length };
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await sleep(retryDelayMs);
      }
    }
  }

  console.error(`${label}: FAIL (${lastErr?.message || 'unknown error'})`);
  return { ok: false, error: lastErr };
}

async function main() {
  console.log('Verifying sites...');

  // Local can be booting up, so retry.
  const local = await checkUrl(LOCAL_BASE, 'LOCAL_HOME', {
    retries: 12,
    retryDelayMs: 1000,
  });

  const vercel = await checkUrl(VERCEL_BASE, 'VERCEL_HOME', {
    retries: 2,
    retryDelayMs: 1000,
  });

  let allSheetsOk = true;
  for (const sheet of SHEETS) {
    const apiUrl = `${LOCAL_BASE}/api/sheet-data?sheet=${encodeURIComponent(sheet)}`;
    const result = await checkUrl(apiUrl, `LOCAL_API_${sheet}`, {
      retries: 2,
      retryDelayMs: 500,
    });
    if (!result.ok) allSheetsOk = false;
  }

  const ok = local.ok && vercel.ok && allSheetsOk;
  if (!ok) {
    process.exitCode = 1;
    console.error('Verification failed.');
  } else {
    console.log('Verification passed.');
  }
}

main().catch((err) => {
  console.error('Unexpected failure:', err?.message || err);
  process.exit(1);
});

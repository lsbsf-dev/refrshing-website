export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

    setInterval(async () => {
      try {
        const url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        console.log(`[Self-Ping] Pinging ${url}/api/ping at ${new Date().toISOString()}`);
        const res = await fetch(`${url}/api/ping`);
        if (!res.ok) {
          console.error('[Self-Ping] Failed with status:', res.status);
        }
      } catch (error) {
        console.error('[Self-Ping] Error:', error);
      }
    }, PING_INTERVAL);
  }
}

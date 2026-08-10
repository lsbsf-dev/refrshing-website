export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

    setInterval(async () => {
      try {
        const port = process.env.PORT || '3000';
        const url = process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${port}`;
        // Skip pinging in dev mode if it's pointing to localhost, to avoid hitting other local services like MySQL.
        if (url.includes('localhost') && process.env.NODE_ENV !== 'production') {
          return;
        }
        
        console.log(`[Self-Ping] Pinging ${url}/api/ping at ${new Date().toISOString()}`);
        const res = await fetch(`${url}/api/ping`);
        if (!res.ok) {
          console.error('[Self-Ping] Failed with status:', res.status);
        }
      } catch (error: any) {
        // Silently ignore HTTP parsing errors from hitting non-HTTP services
        if (error?.cause?.code !== 'HPE_INVALID_CONSTANT') {
          console.error('[Self-Ping] Error:', error.message || error);
        }
      }
    }, PING_INTERVAL);
  }
}

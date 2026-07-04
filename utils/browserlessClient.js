const BROWSERLESS_BASE_URL = "https://production-sfo.browserless.io";

export default class Browserless {
  constructor({ apiKey }) {
    this.apiKey = apiKey;
    this._sessions = new Map();
  }

  sessions = {
    create: async ({ browserSettings } = {}) => {
      const response = await fetch(
        `${BROWSERLESS_BASE_URL}/session?token=${this.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ttl: 180000,
            blockAds: browserSettings?.blockAds ?? false,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Browserless session failed: ${errorText}`);
      }

      const data = await response.json();
      const session = {
        id: data.id ?? crypto.randomUUID(),
        connectUrl: data.connect,
        stopUrl: data.stop,
      };

      this._sessions.set(session.id, session);
      return session;
    },

    destroy: async (id) => {
      const session = this._sessions.get(id);
      if (!session?.stopUrl) {
        return;
      }

      await fetch(session.stopUrl, { method: "DELETE" }).catch(() => {});
      this._sessions.delete(id);
    },
  };
}

import { chromium } from 'playwright';
import Browserless from '../utils/browserlessClient.js';

const bl = new Browserless({
  apiKey: process.env.BROWSERLESS_API_KEY,
});

export async function scraperUrl(url) {
  let browser;
  let session;

  try {
    session = await bl.sessions.create({
      browserSettings: {
        blockAds: true,
      },
    });

    browser = await chromium.connectOverCDP(session.connectUrl);

    const context =
      browser.contexts()[0] || (await browser.newContext());

    const page = await context.newPage();

    page.setDefaultNavigationTimeout(30000);

    const startTime = Date.now();

    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
    });

    await page.waitForLoadState('networkidle').catch(() => {});

    const loadTime = Date.now() - startTime;

    const scrapedData = await page.evaluate(() => {
      const getMeta = (name) => {
        const el =
          document.querySelector(`meta[name="${name}"]`) ||
          document.querySelector(`meta[property="${name}"]`);

        return el?.getAttribute("content") || "";
      };

      const title = document.title || "";
      const description = getMeta("description");
      const canonical =
        document.querySelector('link[rel="canonical"]')?.href || "";
      const robots = getMeta("robots");
      const ogTitle = getMeta("og:title");
      const ogDescription = getMeta("og:description");
      const ogImage = getMeta("og:image");
      const twitterCard = getMeta("twitter:card");
      const viewport = getMeta("viewport");

      const charset =
        document.querySelector("meta[charset]")?.getAttribute("charset") || "";

      const h1Texts = [...document.querySelectorAll("h1")].map((el) =>
        (el.textContent || "").trim()
      );

      const headings = {
        h1: document.querySelectorAll("h1").length,
        h2: document.querySelectorAll("h2").length,
        h3: document.querySelectorAll("h3").length,
        h4: document.querySelectorAll("h4").length,
        h5: document.querySelectorAll("h5").length,
        h6: document.querySelectorAll("h6").length,
        h1Texts,
      };

      const currentHost = location.hostname;

      const links = [...document.querySelectorAll("a[href]")];

      let internal = 0;
      let external = 0;

      for (const link of links) {
        try {
          if (
            link.href.startsWith("mailto:") ||
            link.href.startsWith("tel:")
          ) {
            continue;
          }

          const parsed = new URL(link.href);

          if (parsed.hostname === currentHost) {
            internal++;
          } else {
            external++;
          }
        } catch {}
      }

      const images = [...document.querySelectorAll("img")];

      const missingAlt = images.filter(
        (img) => !img.alt || img.alt.trim() === ""
      ).length;

      const bodyText = document.body?.innerText || "";

      return {
        metaData: {
          title,
          description,
          canonical,
          robots,
          ogTitle,
          ogDescription,
          ogImage,
          twitterCard,
          viewport,
          charset,
        },

        headings,

        links: {
          internal,
          external,
          total: links.length,
        },

        images: {
          total: images.length,
          missingAlt,
          withAlt: images.length - missingAlt,
        },

        wordCount: bodyText
          .split(/\s+/)
          .filter(Boolean).length,

        pageSize: document.documentElement.outerHTML.length,

        bodyText: bodyText.slice(0, 3000),
      };
    });

    return {
      success: true,
      data: {
        ...scrapedData,
        loadTime,
        statusCode: response?.status() ?? 0,
        url,
      },
    };
  } catch (error) {
    console.error("[SCRAPER]", error);

    return {
      success: false,
      error: error.message,
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }

    if (session?.id) {
      await bl.sessions
        .destroy(session.id)
        .catch(() => {});
    }
  }
}
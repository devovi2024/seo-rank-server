import { chromium } from "playwright";
import Browserless from "../utils/browserlessClient.js";

const bl = new Browserless({
  apiKey: process.env.BROWSERLESS_API_KEY,
});

export async function rankTracker(keyword, targetDomain) {
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

    page.setDefaultNavigationTimeout(45000);

    await page.goto("https://www.google.com", {
      waitUntil: "networkidle",
    });

    try {
      const consent = await page.$(
        'button[id="L2AGLb"], form[action*="consent"] button'
      );

      if (consent) {
        await consent.click();
        await page.waitForTimeout(1500);
      }
    } catch {}

    const cleanTarget = targetDomain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .toLowerCase();

    let found = null;
    const allResults = [];

    for (let googlePage = 0; googlePage < 5; googlePage++) {
      await page.goto(
        `https://www.google.com/search?q=${encodeURIComponent(
          keyword
        )}&start=${googlePage * 10}&num=10&hl=en&gl=us`,
        {
          waitUntil: "networkidle",
        }
      );

      let pageResults = [];

      for (let retry = 0; retry < 3; retry++) {
        try {
          await page.waitForSelector("h3", {
            timeout: 8000,
          });

          pageResults = await page.evaluate(() => {
            return [...document.querySelectorAll("h3")]
              .map((h3) => {
                let anchor = h3.closest("a");

                if (!anchor) {
                  let parent = h3.parentElement;

                  for (let i = 0; i < 5 && parent; i++) {
                    if (parent.tagName === "A") {
                      anchor = parent;
                      break;
                    }

                    const nested = parent.querySelector("a[href]");

                    if (nested?.contains(h3)) {
                      anchor = nested;
                      break;
                    }

                    parent = parent.parentElement;
                  }
                }

                if (
                  !anchor ||
                  !anchor.href.startsWith("http") ||
                  anchor.href.includes("google.")
                ) {
                  return null;
                }

                let snippet = "";
                let node = anchor.parentElement;

                for (let i = 0; i < 6 && node; i++) {
                  const text = node.innerText || "";

                  if (text.length > h3.innerText.length + 50) {
                    snippet =
                      text
                        .split("\n")
                        .find(
                          (line) =>
                            line.length > 30 &&
                            !line.includes(h3.innerText.slice(0, 20))
                        ) || "";

                    snippet = snippet.trim().slice(0, 300);

                    if (snippet) break;
                  }

                  node = node.parentElement;
                }

                return {
                  url: anchor.href,
                  domain: new URL(anchor.href).hostname.replace(
                    /^www\./,
                    ""
                  ),
                  title: h3.innerText.trim(),
                  snippet,
                };
              })
              .filter(Boolean);
          });

          if (pageResults.length) {
            break;
          }

          await page.reload({
            waitUntil: "networkidle",
          });
        } catch {
          if (retry === 2) {
            break;
          }

          await page.reload({
            waitUntil: "networkidle",
          });
        }
      }

      if (!pageResults.length) {
        break;
      }

      for (const result of pageResults) {
        result.position = allResults.length + 1;

        allResults.push(result);

        const domain = result.domain.toLowerCase();

        if (
          !found &&
          (domain.includes(cleanTarget) ||
            cleanTarget.includes(domain))
        ) {
          found = {
            ...result,
            page: googlePage + 1,
          };
        }
      }

      if (found) {
        break;
      }

      await page.waitForTimeout(
        2000 + Math.random() * 2000
      );
    }

    const competitors = allResults
      .filter((result) => {
        const domain = result.domain.toLowerCase();

        return (
          !domain.includes(cleanTarget) &&
          !cleanTarget.includes(domain)
        );
      })
      .slice(0, 10);

    return {
      success: true,
      data: {
        keyword,
        targetDomain,
        position: found?.position ?? null,
        page: found?.page ?? null,
        title: found?.title ?? "",
        snippet: found?.snippet ?? "",
        competitors,
        totalResultsScanned: allResults.length,
      },
    };
  } catch (error) {
    console.error("[RANK TRACKER]", error);

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
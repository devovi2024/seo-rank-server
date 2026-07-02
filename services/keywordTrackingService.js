import { rankTracker } from "./rankTrackerService.js";

export async function keywordTracking(tracking) {
  try {
    let result;

    for (let attempt = 1; attempt <= 2; attempt++) {
      result = await rankTracker(
        tracking.keyword,
        tracking.domain
      );

      if (
        result?.success &&
        result.data?.totalResultsScanned > 0
      ) {
        break;
      }

      if (attempt < 2) {
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            result?.success ? 3000 : 5000
          )
        );
      }
    }

    if (result?.success) {
      const previousPosition = tracking.currentPosition;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      tracking.currentPosition = result.data.position;
      tracking.currentPage = result.data.page;
      tracking.competitors = result.data.competitors;
      tracking.lastChecked = new Date();
      tracking.status = "completed";

      tracking.positionChange =
        previousPosition && result.data.position
          ? previousPosition - result.data.position
          : 0;

      if (
        result.data.position &&
        (!tracking.bestPosition ||
          result.data.position < tracking.bestPosition)
      ) {
        tracking.bestPosition = result.data.position;
      }

      const historyEntry = {
        date: today,
        position: result.data.position,
        page: result.data.page,
        title: result.data.title,
        snippet: result.data.snippet,
      };

      const historyIndex = tracking.rankHistory.findIndex(
        (item) =>
          new Date(item.date).toDateString() ===
          today.toDateString()
      );

      if (historyIndex >= 0) {
        tracking.rankHistory[historyIndex] = historyEntry;
      } else {
        tracking.rankHistory.push(historyEntry);
      }
    } else {
      tracking.status = "failed";
    }

    await tracking.save();

    return result;
  } catch (error) {
    console.error("[KEYWORD TRACKING]", error);

    tracking.status = "failed";

    await tracking.save().catch(() => {});

    return {
      success: false,
      error: error.message,
    };
  }
}
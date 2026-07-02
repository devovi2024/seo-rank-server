import cron from 'node-cron';
import KeywordTracking from '../models/KeywordTracking.js';
import { keywordTracking } from '../services/keywordTrackingService.js';

export function startRankTrackingCron() {
  cron.schedule('0 6 * * *', async () => {
    console.log('Starting daily rank tracking cron job...');

    try {
      const activeTrackings = await KeywordTracking.find({
        active: true,
        status: { $ne: 'checking' },
      });

      if (activeTrackings.length === 0) {
        console.log('No active keywords to track today.');
        return;
      }

      console.log(
        `Found ${activeTrackings.length} keywords to track.`
      );

      for (const tracking of activeTrackings) {
        try {
          tracking.status = 'checking';
          await tracking.save();

          await keywordTracking(tracking);

          const delay = 2000 + Math.random() * 3000;

          await new Promise((resolve) =>
            setTimeout(resolve, delay)
          );
        } catch (err) {
          console.error(
            `Error tracking keyword ${tracking.keyword} for user ${tracking.userId}:`,
            err.message
          );

          try {
            tracking.status = 'failed';
            await tracking.save();
          } catch (saveErr) {
            console.error(
              'Failed to save failed status:',
              saveErr.message
            );
          }
        }
      }

      console.log('Daily rank tracking completed.');
    } catch (error) {
      console.error('Cron job error:', error.message);
    }
  });

  console.log('Rank tracking cron job scheduled for 6:00 AM daily.');
}
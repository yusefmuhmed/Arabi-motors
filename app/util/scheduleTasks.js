const cron = require("node-cron");
const User = require("../../db/models/user.model");

async function scheduleTasks() {
  // Schedule the job to run every 12 hours
  cron.schedule("0 */12 * * *", async () => {
    try {
      console.log(
        `[${new Date().toISOString()}] Running the scheduled job to remove expired tokens...`
      );
      await Teacher.removeExpiredTokens();
      await User.removeExpiredTokens();
    } catch (error) {
      console.error("Error while removing expired tokens:", error);
    }
  });
}

module.exports = scheduleTasks;

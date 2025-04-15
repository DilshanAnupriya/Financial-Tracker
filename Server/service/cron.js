const cron = require('node-cron');
const NotificationController = require('../controller/notificationController'); // Adjust the path

// Run every day at 8 AM
cron.schedule('0 8 * * *', async () => {
    console.log("Running upcomingTransaction...");

    await NotificationController.upcomingTransaction();
    await NotificationController.notifyBudget();
    await NotificationController.notifyDeadline();
    await NotificationController.upcomingGoals();
});


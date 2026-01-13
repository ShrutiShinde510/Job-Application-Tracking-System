const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const listNotifications = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Notification = require('./models/Notification');
        require('./models/User'); // Ensure User model is registered
        const notifications = await Notification.find({}).populate('user', 'email');
        console.log('--- Current Notifications ---');
        console.log(JSON.stringify(notifications, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

listNotifications();

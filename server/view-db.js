const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const viewDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB at:', process.env.MONGO_URI);

        const User = require('./models/User');
        const Application = require('./models/Application');
        const Interview = require('./models/Interview');
        const Notification = require('./models/Notification');

        const userCount = await User.countDocuments();
        const appCount = await Application.countDocuments();
        const interviewCount = await Interview.countDocuments();
        const notifyCount = await Notification.countDocuments();

        console.log('\n--- DATABASE SUMMARY ---');
        console.log(`👥 Users: ${userCount}`);
        console.log(`💼 Applications: ${appCount}`);
        console.log(`🗓️ Interviews: ${interviewCount}`);
        console.log(`🔔 Notifications: ${notifyCount}`);

        if (appCount > 0) {
            console.log('\n--- RECENT APPLICATIONS ---');
            const apps = await Application.find().limit(3).sort({ createdAt: -1 });
            apps.forEach(a => console.log(`- ${a.company} (${a.position}) -> Status: ${a.status}`));
        }

        if (notifyCount > 0) {
            console.log('\n--- RECENT NOTIFICATIONS ---');
            const notes = await Notification.find().limit(3).sort({ createdAt: -1 });
            notes.forEach(n => console.log(`- [${n.type}] ${n.title}: ${n.message}`));
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

viewDatabase();

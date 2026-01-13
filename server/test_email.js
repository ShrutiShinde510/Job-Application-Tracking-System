require('dotenv').config();
const { sendOTPEmail } = require('./utils/sendEmail');

async function test() {
    console.log('Testing email configuration...');
    console.log('Host:', process.env.EMAIL_HOST);
    console.log('Port:', process.env.EMAIL_PORT);
    console.log('User:', process.env.EMAIL_USER);

    try {
        await sendOTPEmail(process.env.EMAIL_USER, '123456', 'Test Admin');
        console.log('✅ Success: OTP email sent to', process.env.EMAIL_USER);
    } catch (error) {
        console.error('❌ Failed:', error.message);
        if (error.message.includes('Invalid login')) {
            console.log('💡 TIP: Use an "App Password" for Gmail if 2FA is enabled.');
        }
    }
}

test();

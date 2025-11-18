/**
 * Email Service
 * Handles sending emails for password reset, verification, etc.
 * 
 * Note: This is a mock implementation for development.
 * For production, integrate with actual email service (SendGrid, AWS SES, Nodemailer, etc.)
 */

/**
 * Email configuration
 * In production, these should be environment variables
 */
const EMAIL_CONFIG = {
    from: process.env.EMAIL_FROM || 'noreply@huskytrack.com',
    replyTo: process.env.EMAIL_REPLY_TO || 'support@huskytrack.com',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};

/**
 * Send password reset email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email address
 * @param {String} options.resetToken - Password reset token
 * @param {String} options.userName - User's name
 * @returns {Promise<Object>} Email send result
 */
const sendPasswordResetEmail = async ({ to, resetToken, userName }) => {
    const resetUrl = `${EMAIL_CONFIG.frontendUrl}/reset-password/${resetToken}`;
    
    const emailContent = {
        to: to,
        from: EMAIL_CONFIG.from,
        subject: 'HuskyTrack - Password Reset Request',
        text: generatePasswordResetText(userName, resetUrl),
        html: generatePasswordResetHTML(userName, resetUrl)
    };
    
    // For development: Log email to console
    if (process.env.NODE_ENV !== 'production') {
        console.log('\nEMAIL MOCK - Password Reset');
        console.log('═══════════════════════════════════════');
        console.log('To:', emailContent.to);
        console.log('Subject:', emailContent.subject);
        console.log('Reset URL:', resetUrl);
        console.log('═══════════════════════════════════════\n');
        
        return {
            success: true,
            message: 'Email logged to console (development mode)',
            resetUrl: resetUrl
        };
    }
    
    // For production: Implement actual email sending
    // Example with Nodemailer:
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail(emailContent);
    
    return {
        success: true,
        message: 'Password reset email sent successfully'
    };
};

/**
 * Send welcome/verification email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email address
 * @param {String} options.userName - User's name
 * @param {String} options.verificationToken - Email verification token (optional)
 * @returns {Promise<Object>} Email send result
 */
const sendWelcomeEmail = async ({ to, userName, verificationToken }) => {
    const verificationUrl = verificationToken 
        ? `${EMAIL_CONFIG.frontendUrl}/verify-email/${verificationToken}`
        : null;
    
    const emailContent = {
        to: to,
        from: EMAIL_CONFIG.from,
        subject: 'Welcome to HuskyTrack!',
        text: generateWelcomeText(userName, verificationUrl),
        html: generateWelcomeHTML(userName, verificationUrl)
    };
    
    // For development: Log email to console
    if (process.env.NODE_ENV !== 'production') {
        console.log('\nEMAIL MOCK - Welcome Email');
        console.log('═══════════════════════════════════════');
        console.log('To:', emailContent.to);
        console.log('Subject:', emailContent.subject);
        if (verificationUrl) {
            console.log('Verification URL:', verificationUrl);
        }
        console.log('═══════════════════════════════════════\n');
        
        return {
            success: true,
            message: 'Email logged to console (development mode)'
        };
    }
    
    return {
        success: true,
        message: 'Welcome email sent successfully'
    };
};

/**
 * Send password changed confirmation email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email address
 * @param {String} options.userName - User's name
 * @returns {Promise<Object>} Email send result
 */
const sendPasswordChangedEmail = async ({ to, userName }) => {
    const emailContent = {
        to: to,
        from: EMAIL_CONFIG.from,
        subject: 'HuskyTrack - Password Changed Successfully',
        text: generatePasswordChangedText(userName),
        html: generatePasswordChangedHTML(userName)
    };
    
    // For development: Log email to console
    if (process.env.NODE_ENV !== 'production') {
        console.log('\nEMAIL MOCK - Password Changed');
        console.log('═══════════════════════════════════════');
        console.log('To:', emailContent.to);
        console.log('Subject:', emailContent.subject);
        console.log('═══════════════════════════════════════\n');
        
        return {
            success: true,
            message: 'Email logged to console (development mode)'
        };
    }
    
    return {
        success: true,
        message: 'Password changed email sent successfully'
    };
};

// ============================================================================
// Email Templates
// ============================================================================

/**
 * Generate password reset email text content
 */
const generatePasswordResetText = (userName, resetUrl) => {
    return `
Hello ${userName},

You recently requested to reset your password for your HuskyTrack account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you did not request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
The HuskyTrack Team
    `.trim();
};

/**
 * Generate password reset email HTML content
 */
const generatePasswordResetHTML = (userName, resetUrl) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h2 style="color: #c8102e; margin-bottom: 20px;">Password Reset Request</h2>
        
        <p>Hello ${userName},</p>
        
        <p>You recently requested to reset your password for your HuskyTrack account.</p>
        
        <p>Click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #c8102e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
            </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
            Or copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #c8102e; word-break: break-all;">${resetUrl}</a>
        </p>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
            <strong>This link will expire in 1 hour.</strong>
        </p>
        
        <p style="font-size: 14px; color: #666;">
            If you did not request a password reset, please ignore this email or contact support if you have concerns.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
            This is an automated email from HuskyTrack. Please do not reply to this email.
        </p>
    </div>
</body>
</html>
    `.trim();
};

/**
 * Generate welcome email text content
 */
const generateWelcomeText = (userName, verificationUrl) => {
    let content = `
Hello ${userName},

Welcome to HuskyTrack! We're excited to have you on board.

HuskyTrack is your go-to platform for discovering and managing campus events.
    `;
    
    if (verificationUrl) {
        content += `

Please verify your email address by clicking the link below:
${verificationUrl}
        `;
    }
    
    content += `

If you have any questions, feel free to reach out to our support team.

Best regards,
The HuskyTrack Team
    `;
    
    return content.trim();
};

/**
 * Generate welcome email HTML content
 */
const generateWelcomeHTML = (userName, verificationUrl) => {
    let verificationSection = '';
    
    if (verificationUrl) {
        verificationSection = `
        <p>Please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #c8102e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email
            </a>
        </div>
        `;
    }
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h2 style="color: #c8102e; margin-bottom: 20px;">Welcome to HuskyTrack!</h2>
        
        <p>Hello ${userName},</p>
        
        <p>Welcome to HuskyTrack! We're excited to have you on board.</p>
        
        <p>HuskyTrack is your go-to platform for discovering and managing campus events.</p>
        
        ${verificationSection}
        
        <p>If you have any questions, feel free to reach out to our support team.</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
            This is an automated email from HuskyTrack. Please do not reply to this email.
        </p>
    </div>
</body>
</html>
    `.trim();
};

/**
 * Generate password changed email text content
 */
const generatePasswordChangedText = (userName) => {
    return `
Hello ${userName},

Your HuskyTrack account password has been successfully changed.

If you did not make this change, please contact our support team immediately.

Best regards,
The HuskyTrack Team
    `.trim();
};

/**
 * Generate password changed email HTML content
 */
const generatePasswordChangedHTML = (userName) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h2 style="color: #c8102e; margin-bottom: 20px;">Password Changed Successfully</h2>
        
        <p>Hello ${userName},</p>
        
        <p>Your HuskyTrack account password has been successfully changed.</p>
        
        <p style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <strong>If you did not make this change,</strong> please contact our support team immediately.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
            This is an automated email from HuskyTrack. Please do not reply to this email.
        </p>
    </div>
</body>
</html>
    `.trim();
};

module.exports = {
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendPasswordChangedEmail,
    EMAIL_CONFIG
};


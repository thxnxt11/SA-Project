// services/email.go
package services

import (
	"fmt"
	"net/smtp"
	"os"
	"strings"
)

type EmailConfig struct {
	SMTPHost     string
	SMTPPort     string
	SMTPUsername string
	SMTPPassword string
	FromEmail    string
	FromName     string
}

type EmailService struct {
	config EmailConfig
}

func NewEmailService() *EmailService {
	return &EmailService{
		config: EmailConfig{
			SMTPHost:     getEnv("SMTP_HOST", "smtp.gmail.com"),
			SMTPPort:     getEnv("SMTP_PORT", "587"),
			SMTPUsername: getEnv("SMTP_USERNAME", ""), // ต้องเป็น Gmail ของคุณ
			SMTPPassword: getEnv("SMTP_PASSWORD", ""), // ต้องเป็น App Password
			FromEmail:    getEnv("FROM_EMAIL", ""),
			FromName:     getEnv("FROM_NAME", "Concert Booking System"),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func (es *EmailService) SendPasswordResetEmail(toEmail, resetToken string) error {
	// สร้าง reset URL
	resetURL := fmt.Sprintf("http://localhost:5173/reset-password?token=%s", resetToken)

	subject := "Password Reset Request"
	body := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h1 style="color: #333;">Password Reset Request</h1>
    </div>
    
    <div style="padding: 20px;">
        <p>Haloooooo,</p>
        
        <p>เราได้รับคำขอให้รีเซ็ตรหัสผ่านของคุณ หากคุณไม่ได้ทำคำขอนี้ คุณสามารถละเว้นอีเมลฉบับนี้ได้</p>
        
        <p>ถ้าอยากจะ reset ให้คลิกที่ปุ่มด้านล่างนี้:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="%s" 
               style="background-color: #1890ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Reset Password
            </a>
        </div>
        
        <p>หรือจะ copy ลิงค์ด้านล่างนี้เพื่อเข้าไปเปลี่ยนรหัส:</p>
        <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
            %s
        </p>
        
        <p><strong>This link will expire in 15 minutes.</strong></p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <p style="color: #666; font-size: 12px;">
            If you're having trouble with the button above, copy and paste the URL into your web browser.
        </p>
    </div>
</body>
</html>
	`, resetURL, resetURL)

	return es.sendEmail(toEmail, subject, body)
}

func (es *EmailService) sendEmail(to, subject, body string) error {
	// Setup authentication
	auth := smtp.PlainAuth("", es.config.SMTPUsername, es.config.SMTPPassword, es.config.SMTPHost)

	// Setup message
	msg := []string{
		fmt.Sprintf("From: %s <%s>", es.config.FromName, es.config.FromEmail),
		fmt.Sprintf("To: %s", to),
		fmt.Sprintf("Subject: %s", subject),
		"MIME-Version: 1.0",
		"Content-Type: text/html; charset=UTF-8",
		"",
		body,
	}

	// Send email
	err := smtp.SendMail(
		fmt.Sprintf("%s:%s", es.config.SMTPHost, es.config.SMTPPort),
		auth,
		es.config.FromEmail,
		[]string{to},
		[]byte(strings.Join(msg, "\r\n")),
	)

	if err != nil {
		return fmt.Errorf("failed to send email: %v", err)
	}

	return nil
}

func (es *EmailService) SendEmail(to string, subject string, body string) error {
	auth := smtp.PlainAuth("", es.config.SMTPUsername, es.config.SMTPPassword, es.config.SMTPHost)
	msg := "From: " + es.config.FromEmail + "\n" +
		"To: " + to + "\n" +
		"Subject: " + subject + "\n\n" +
		body
	return smtp.SendMail(es.config.SMTPHost+":"+es.config.SMTPPort, auth, es.config.FromEmail, []string{to}, []byte(msg))
} 
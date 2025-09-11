// services/email.go
package services

import (
	"encoding/base64"
	"fmt"
	"net/smtp"
	"os"
	"strings"
	"time"

	"github.com/skip2/go-qrcode"
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

// สร้าง QR Code เป็น CID attachment แทน data URI
func (es *EmailService) sendEmailWithAttachment(to, subject, body string, attachments map[string][]byte) error {
	auth := smtp.PlainAuth("", es.config.SMTPUsername, es.config.SMTPPassword, es.config.SMTPHost)

	boundary := fmt.Sprintf("boundary-%d", time.Now().Unix())

	headers := []string{
		fmt.Sprintf("From: %s <%s>", es.config.FromName, es.config.FromEmail),
		fmt.Sprintf("To: %s", to),
		fmt.Sprintf("Subject: %s", subject),
		"MIME-Version: 1.0",
		fmt.Sprintf("Content-Type: multipart/related; boundary=%s", boundary),
		"",
	}

	// HTML Body
	msgBody := []string{
		fmt.Sprintf("--%s", boundary),
		"Content-Type: text/html; charset=UTF-8",
		"Content-Transfer-Encoding: 7bit",
		"",
		body,
		"",
	}

	// Attachments
	for cid, data := range attachments {
		attachment := []string{
			fmt.Sprintf("--%s", boundary),
			"Content-Type: image/png",
			"Content-Transfer-Encoding: base64",
			fmt.Sprintf("Content-ID: <%s>", cid),
			"Content-Disposition: inline",
			"",
			base64.StdEncoding.EncodeToString(data),
			"",
		}
		msgBody = append(msgBody, attachment...)
	}

	msgBody = append(msgBody, fmt.Sprintf("--%s--", boundary))

	message := strings.Join(headers, "\r\n") + strings.Join(msgBody, "\r\n")

	err := smtp.SendMail(
		fmt.Sprintf("%s:%s", es.config.SMTPHost, es.config.SMTPPort),
		auth,
		es.config.FromEmail,
		[]string{to},
		[]byte(message),
	)

	if err != nil {
		return fmt.Errorf("failed to send email with attachment: %v", err)
	}

	return nil
}

// แปลงเวลาให้อ่านง่าย
func formatDateHuman(iso string) string {
	t, err := time.Parse(time.RFC3339, iso)
	if err != nil {
		return iso
	}
	return t.Format("02 Jan 2006 15:04") // 15:04 = HH:mm
}

// ส่ง E-Ticket ทีละหลายใบ (รวมในอีเมลเดียว) - Fixed Version
func (es *EmailService) SendETicketEmail(toEmail string, tickets []ETicketResponse) error {
	if len(tickets) == 0 {
		return nil
	}

	var sb strings.Builder
	attachments := make(map[string][]byte)

	sb.WriteString(`<!DOCTYPE html><html><body style="font-family:Arial;background:#f5f7fb;padding:20px;">`)
	sb.WriteString(`<h2 style="text-align:center;color:#082f6d;margin:0 0 12px;">Your E-Tickets</h2>`)
	sb.WriteString(`<p style="text-align:center;color:#444;margin:0 0 20px;">ชำระเงินสำเร็จ! ด้านล่างคือ E-Ticket ของคุณ</p>`)

	for i, t := range tickets {
		ref := t.UUID
		if ref == "" {
			ref = t.BookingCode
		}

		// สร้าง QR Code เป็น PNG bytes
		qrContent := "http://localhost:8000/e-ticket/" + ref
		qrPNG, err := qrcode.Encode(qrContent, qrcode.Medium, 200)
		if err != nil {
			fmt.Printf("QR Encode error for ticket %d: %v\n", i, err)
			continue
		}

		// เก็บ QR เป็น attachment
		qrCID := fmt.Sprintf("qr%d", i)
		attachments[qrCID] = qrPNG

		zoneLabel := "Seat"
		seatOrQueue := "-"
		if strings.HasPrefix(strings.ToLower(strings.TrimSpace(t.ZoneType)), "seat") {
			if t.SeatLabel != nil {
				seatOrQueue = *t.SeatLabel
			}
		} else {
			zoneLabel = "Queue"
			if t.QueueNumber != nil {
				seatOrQueue = fmt.Sprintf("%d", *t.QueueNumber)
			}
		}

		// ใช้ table layout แทน flexbox สำหรับ email compatibility
		card := fmt.Sprintf(`
<div style="width:350px;margin:18px auto;border-radius:14px;border:10px solid #002a66;background:#fff;box-shadow:0 10px 20px rgba(0,0,0,.08);overflow:hidden;">
  <div style="padding:12px 14px 8px;border-bottom:1px solid #eaeaea;">
    <div style="font-weight:bold;font-size:18px;line-height:1.3;">%s</div>
    <div style="color:#666;font-size:16px;font-weight:bold;">%s</div>
  </div>

  <div style="padding:14px;">
    <div style="border-top:2px dashed #a7c0e8;margin:0 12px 12px;"></div>
    
    <div style="padding:12px 0;text-align:center;">
      <img src="cid:%s" width="140" height="140" alt="QR Code" style="display:block;margin:0 auto;"/>
    </div>
    
    <div style="border-top:2px dashed #a7c0e8;margin:0 12px 12px;"></div>

    <table style="width:100%%;margin:8px 0;">
      <tr>
        <td style="color:#666;font-weight:bold;">Booking ID:</td>
        <td style="font-weight:bold;text-align:right;">%s</td>
      </tr>
    </table>

    <div style="border-top:2px dashed #a7c0e8;margin:0 12px 12px;"></div>

    <table style="width:100%%;margin:8px 0;">
      <tr>
        <td style="width:50%%;">
          <div style="color:#666;font-weight:bold;">Zone Type</div>
          <div style="font-weight:bold;">%s</div>
        </td>
        <td style="width:50%%;text-align:right;">
          <div style="color:#666;font-weight:bold;">Price (THB)</div>
          <div style="font-weight:bold;">%s</div>
        </td>
      </tr>
    </table>

    <table style="width:100%%;margin:8px 0;">
      <tr>
        <td style="width:50%%;">
          <div style="color:#666;font-weight:bold;">Zone</div>
          <div style="font-weight:bold;">%s</div>
        </td>
        <td style="width:50%%;text-align:right;">
          <div style="color:#666;font-weight:bold;">%s</div>
          <div style="font-weight:bold;">%s</div>
        </td>
      </tr>
    </table>

    <div style="margin-top:10px;">
      <div style="color:#666;font-weight:bold;">Date Time</div>
      <div style="font-weight:bold;">%s</div>
    </div>
  </div>

  <div style="background:linear-gradient(180deg,#00306e 30%%,#004a8f 100%%);padding:10px 14px;color:#fff;text-align:center;font-weight:bold;">
    Eventix
  </div>
</div>
		`,
			t.ConcertName,
			t.VenueName,
			qrCID, // ใช้ CID แทน data URI
			t.BookingCode,
			t.ZoneType,
			fmt.Sprintf("%d", t.Price), // เพิ่มคอมมาให้ราคา
			t.Zone,
			zoneLabel,
			seatOrQueue,
			formatDateHuman(t.ShowTimeISO),
		)
		sb.WriteString(card)
	}

	sb.WriteString(`<p style="text-align:center;color:#666;margin-top:12px;">กรุณาแสดง QR นี้ที่หน้างาน</p>`)
	sb.WriteString(`</body></html>`)

	// ส่งอีเมลพร้อม attachments
	return es.sendEmailWithAttachment(toEmail, "Your E-Tickets", sb.String(), attachments)
}

func (es *EmailService) SendEmail(to string, subject string, body string) error {
    auth := smtp.PlainAuth("", es.config.SMTPUsername, es.config.SMTPPassword, es.config.SMTPHost)
    msg := "From: " + es.config.FromEmail + "\n" +
        "To: " + to + "\n" +
        "Subject: " + subject + "\n\n" +
        body
    return smtp.SendMail(es.config.SMTPHost+":"+es.config.SMTPPort, auth, es.config.FromEmail, []string{to}, []byte(msg))
}
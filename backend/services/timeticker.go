// services/booking_worker.go
package services

import (
	"log"
	"time"
)

// รันเป็น background job ทุก 30 วินาที เพื่อตรวจและ expire booking ที่หมดเวลา
func StartExpiryWorker(svc *BookingService) {
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			n, err := svc.ExpirePendingBookings()
			if err != nil {
				log.Printf("[expire] error: %v", err)
				continue
			}
			if n > 0 {
				log.Printf("[expire] expired %d bookings", n)
			}
		}
	}()
}

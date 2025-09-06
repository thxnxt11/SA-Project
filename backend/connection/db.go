package connection

import (
	"fmt"
	"time"

	"github.com/yourname/went-back/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func DB() *gorm.DB {
	return db
}

func ConnectionDB() {
	database, err := gorm.Open(sqlite.Open("sa.db?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	fmt.Println("connected database")
	db = database
}

func SetupDatabase() {
	db.AutoMigrate(
		&entity.User{},
		&entity.Genders{},
		&entity.Role{},
		&entity.PromotionType{},
		&entity.Promotion{},
		&entity.Concert{},
		&entity.ShowDate{},
		&entity.Venue{},
		&entity.VenueType{},
		&entity.VenueStatus{},
		&entity.Booking{},
		&entity.BookingStatus{},
		&entity.BookingSeat{},
		&entity.PaymentMethod{},
		&entity.PaymentStatus{},
		&entity.Payment{},
		&entity.Seat{},
		&entity.SeatAvailable{},
		&entity.Zone{},
		&entity.ZoneType{},
		&entity.RefundType{},
		&entity.RefundStatus{},
		&entity.Refund{},
		&entity.Report{},
		&entity.ReportType{},
		&entity.ReportStatus{},
	)

	GenderMale := entity.Genders{Gender: "Male"}
	GenderFemale := entity.Genders{Gender: "Female"}

	db.FirstOrCreate(&GenderMale, &entity.Genders{Gender: "Male"})
	db.FirstOrCreate(&GenderFemale, &entity.Genders{Gender: "Female"})

	//organizer account
	hashedPassword, _ := HashPassword("123456")
	BirthDay, _ := time.Parse("2006-01-02", "1988-11-12")
	Member := &entity.User{
		FirstName: "SM",
		LastName:  "TRUE",
		Email:     "SMTRUE@gmail.com",
		Age:       50,
		Password:  hashedPassword,
		BirthDay:  BirthDay,
		Phonenum:  "xxx-xxx-xxxx",
		GenderID:  1,
		RoleID:    1,
	}
	db.FirstOrCreate(Member, &entity.User{
		Email: "SMTRUE@gmail.com",
	})
	Organizer := &entity.User{
		FirstName: "John",
		LastName:  "Doe",
		Email:     "ENTERTAIN@gmail.com",
		Age:       40,
		Password:  hashedPassword,
		BirthDay:  BirthDay,
		Phonenum:  "xxx-xxx-xxxx",
		GenderID:  1,
		RoleID:    1,
	}
	db.FirstOrCreate(Organizer, &entity.User{
		Email: "ENTERTAIN@gmail.com",
	})

	//promotion type
	db.FirstOrCreate(&entity.PromotionType{}, entity.PromotionType{
		PromotionType: "Early Bird",
	})
	db.FirstOrCreate(&entity.PromotionType{}, entity.PromotionType{
		PromotionType: "Code",
	})
	db.FirstOrCreate(&entity.PromotionType{}, entity.PromotionType{
		PromotionType: "Concert",
	})

	//zone type
	db.FirstOrCreate(&entity.ZoneType{}, entity.ZoneType{
		ZoneType: "Standing",
	})
	db.FirstOrCreate(&entity.ZoneType{}, entity.ZoneType{
		ZoneType: "Seating",
	})

	//role
	db.FirstOrCreate(&entity.Role{}, entity.Role{
		Role: "Organizer",
	})
	db.FirstOrCreate(&entity.Role{}, entity.Role{
		Role: "Member",
	})
	db.FirstOrCreate(&entity.Role{}, entity.Role{
		Role: "Admin",
	})
	db.FirstOrCreate(&entity.Role{}, entity.Role{
		Role: "Staff",
	})

	// booking status
	db.FirstOrCreate(&entity.BookingStatus{}, entity.BookingStatus{
		BookingStatus: "pending",
	})
	db.FirstOrCreate(&entity.BookingStatus{}, entity.BookingStatus{
		BookingStatus: "paided",
	})
	db.FirstOrCreate(&entity.BookingStatus{}, entity.BookingStatus{
		BookingStatus: "cancelled",
	})
	db.FirstOrCreate(&entity.BookingStatus{}, entity.BookingStatus{
		BookingStatus: "expired",
	})
	db.FirstOrCreate(&entity.BookingStatus{}, entity.BookingStatus{
		BookingStatus: "refunded",
	})

	// refund type
	db.FirstOrCreate(&entity.RefundType{}, entity.RefundType{
		RefundTypeName: "Non Refundable Ticket",
		RefundFee:      0,
	})

	db.FirstOrCreate(&entity.RefundType{}, entity.RefundType{
		RefundTypeName: "Refundable Ticket",
		RefundFee:      299,
	})

	// payment method
	db.FirstOrCreate(&entity.PaymentMethod{}, entity.PaymentMethod{
		PaymentMethodName: "QR PromptPay",
		AccountName:       "Eventix Entertainment",
		AccountNumber:     "0902745366",
		BankName:          "PromptPay",
	})

	db.FirstOrCreate(&entity.PaymentMethod{}, entity.PaymentMethod{
		PaymentMethodName: "Account Number",
		AccountName:       "Eventix Entertainment",
		AccountNumber:     "123-4-56789-0",
		BankName:          "Bangkok Bank(BBL)",
	})

	// payment status
	db.FirstOrCreate(&entity.PaymentStatus{}, entity.PaymentStatus{
		PaymentStatus: "pending payment",
	})
	db.FirstOrCreate(&entity.PaymentStatus{}, entity.PaymentStatus{
		PaymentStatus: "paided",
	})
	db.FirstOrCreate(&entity.PaymentStatus{}, entity.PaymentStatus{
		PaymentStatus: "cancelled",
	})
	db.FirstOrCreate(&entity.PaymentStatus{}, entity.PaymentStatus{
		PaymentStatus: "expired",
	})
	db.FirstOrCreate(&entity.PaymentStatus{}, entity.PaymentStatus{
		PaymentStatus: "refunded",
	})

	// report type

	db.FirstOrCreate(&entity.ReportType{}, entity.ReportType{Type_name: "Report"})
	db.FirstOrCreate(&entity.ReportType{}, entity.ReportType{Type_name: "Feedback"})

	// report status
	db.FirstOrCreate(&entity.ReportStatus{}, entity.ReportStatus{Status_name: "รอการตอบกลับ"})
	db.FirstOrCreate(&entity.ReportStatus{}, entity.ReportStatus{Status_name: "ตอบกลับแล้ว"})

	// refund status
	db.FirstOrCreate(&entity.RefundStatus{}, entity.RefundStatus{Status_name: "รอดำเนินการ"})
	db.FirstOrCreate(&entity.RefundStatus{}, entity.RefundStatus{Status_name: "กำลังดำเนินการ"})
	db.FirstOrCreate(&entity.RefundStatus{}, entity.RefundStatus{Status_name: "ดำเนินการเสร็จสิ้น"})
	db.FirstOrCreate(&entity.RefundStatus{}, entity.RefundStatus{Status_name: "ปฏิเสธคำขอ"})

	db.FirstOrCreate(&entity.Bank{}, entity.Bank{Bank_Name: "KMA"})
	db.FirstOrCreate(&entity.Bank{}, entity.Bank{Bank_Name: "SCP"})

	// SeedSeatAvailable(DB())

	// sql := `
	// 	UPDATE seat_availables
	// 	SET seat_available_status = 'available'
	// 	WHERE rowid IN (
	// 		SELECT rowid
	// 		FROM seat_availables
	// 		WHERE zone_id = ?
	// 	)
	// `
	// result := db.Exec(sql,2 )
	// res := db.Exec(sql,4 )
	// if result.Error != nil {
	// 	panic(result.Error)
	// }
	// if res.Error != nil {
	// 	panic(res.Error)
	// }

}

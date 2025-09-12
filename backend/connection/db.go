package connection

import (
	"fmt"
	"os"
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
   dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./database.db" // default path
	}
   database, err := gorm.Open(sqlite.Open("sa.db?cache=shared"), &gorm.Config{})
   if err != nil {
       panic("failed to connect database")
   }
   fmt.Println("connected database")
   db = database
}

func SetupDatabase() {
   db.AutoMigrate(
      &entity.Action{},
      &entity.Assignment{},
      &entity.AssignmentStatus{},
      &entity.Bank{},
      &entity.Booking{},
      &entity.BookingSeat{},
      &entity.BookingStatus{},
      &entity.Cart{},
      &entity.CartItem{},
      &entity.Category{},
      &entity.Color{},
      &entity.Concert{},
      &entity.Department{},
      &entity.Equipment{},
      &entity.EquipmentType{},
      &entity.Genders{},
      &entity.PasswordReset{},
      &entity.Payment{},
      &entity.PaymentMethod{},
      &entity.PaymentOrder{},
      &entity.PaymentStatus{},
      &entity.Position{},
      &entity.Product{},
      &entity.Promotion{},
      &entity.PromotionType{},
      &entity.Refund{},
      &entity.RefundStatus{},
      &entity.RefundType{},
      &entity.Report{},
      &entity.ReportReply{},
      &entity.ReportStatus{},
      &entity.ReportType{},
      &entity.Role{},
      &entity.Seat{},
      &entity.SeatAvailable{},
      &entity.ShowDate{},
      &entity.Size{},
      &entity.StaffAssignment{},
      &entity.Stage{},
      &entity.StageEquipment{},
      &entity.StageType{},
      &entity.StockMovement{},
      &entity.User{},
      &entity.Variant{},
      &entity.Venue{},
      &entity.VenueStatus{},
      &entity.VenueType{},
      &entity.WorkSchedule{},
      &entity.Zone{},
      &entity.ZoneType{}, 
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
       RoleID: 1,
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
       RoleID: 1,
   }
   db.FirstOrCreate(Organizer, &entity.User{
       Email: "ENTERTAIN@gmail.com",
   })
    Admin := &entity.User{
        FirstName: "Admin",
        LastName:  "Nongmos",
        Email:     "mostnpt14@gmail.com",
        Age:       21,
        Password:  hashedPassword,
        BirthDay:  BirthDay,
        Phonenum:  "xxx-xxx-xxxx",
        GenderID:  1,
        RoleID:    3,
    }
    db.FirstOrCreate(Admin, &entity.User{
        Email: "mostnpt14@gmail.com",
    })

   //promotion type
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
      RefundFee: 0,
   })

   db.FirstOrCreate(&entity.RefundType{}, entity.RefundType{
      RefundTypeName: "Refundable Ticket",
      RefundFee: 299,
   })

   // payment method
   db.FirstOrCreate(&entity.PaymentMethod{}, entity.PaymentMethod{
      PaymentMethodName: "QR PromptPay",
      AccountName: "Eventix Entertainment",
      AccountNumber: "0902745366",
      BankName: "PromptPay",
   })

   db.FirstOrCreate(&entity.PaymentMethod{}, entity.PaymentMethod{
      PaymentMethodName: "Account Number",
      AccountName: "Eventix Entertainment",
      AccountNumber: "123-4-56789-0",
      BankName: "Bangkok Bank(BBL)",
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

	db.FirstOrCreate(&entity.Bank{}, entity.Bank{Bank_Name: "ธนาคารกรุงเทพ(ฺฺBBL)"})
	db.FirstOrCreate(&entity.Bank{}, entity.Bank{Bank_Name: "ธนาคารกรุงไทย(ฺฺKTB)"})
   db.FirstOrCreate(&entity.Bank{}, entity.Bank{Bank_Name: "ธนาคารกสิกรไทย(KBANK)"})
   db.FirstOrCreate(&entity.Bank{}, entity.Bank{Bank_Name: "ธนาคารไทยพาณิชย์(SCB)"})
   db.FirstOrCreate(&entity.Bank{}, entity.Bank{Bank_Name: "ธนาคารกรุงศรีอยุธยา(BAY)"})

   // --- Action ---
    action := []string{"IN", "OUT", "UPDATE" , "SALE"}
    for _, ac := range action {
        db.FirstOrCreate(&entity.Action{}, entity.Action{Action: ac})
    }

    // --- Colors ---
    colors := []string{"Red", "Black", "Blue"}
    for _, c := range colors {
        db.FirstOrCreate(&entity.Color{}, entity.Color{Color: c})
    }

    // --- Sizes ---
    sizes := []string{"s", "m", "l", "xl", "xxl"}
    for _, s := range sizes {
        db.FirstOrCreate(&entity.Size{}, entity.Size{Size: s})
    }

    // --- Categories ---
    categories := []string{"T-Shirt", "Cap", "Hoodie", "CD"}
    for _, cat := range categories {
        db.FirstOrCreate(&entity.Category{}, entity.Category{Category: cat})
    }
     // --- Example Product ---
    db.FirstOrCreate(&entity.Product{}, entity.Product{
        ProductName:    "Once T-Shirt",
        CategoryID:     1,
        ProductDetail:  "The must have item for once",
        ProductPrice:   1299.00,
        Minimum:        100,
        Sales:          0,
        Total:          20,
        ConcertID:        1,
    })

    db.FirstOrCreate(&entity.Variant{}, entity.Variant{
        ProductID:      1,
        ColorID:        1,
        SizeID:         2,
        Quantity:       20,
        Picture:        "/uploads/products/1757523971551195800_oneShirt1.jpg",
    })
}

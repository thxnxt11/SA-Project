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
       &entity.Assignment{},
       &entity.AssignmentConcert{},
       &entity.AssignmentStatus{},
       &entity.Bank{},
       &entity.Booking{},
       &entity.BookingStatus{},
       &entity.BookingSeat{},
       &entity.Cart{},
       &entity.Cartitem{},
       &entity.Catagory{},
       &entity.Color{},
       &entity.Concert{},
       &entity.Department{},
       &entity.Equipment{},
       &entity.EquipmentType{},
       &entity.Genders{},
       &entity.Movement{},
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
       &entity.Report{},
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
       &entity.User{},
       &entity.Variant{},
       &entity.Venue{},
       &entity.VenueStatus{},
       &entity.VenueType{},
       &entity.Warehouse{},
       &entity.WorkSchedule{},
       &entity.Zone{},
       &entity.ZoneType{},

   )
   
   GenderMale := entity.Genders{Gender: "Male"}
   GenderFemale := entity.Genders{Gender: "Female"}

   db.FirstOrCreate(&GenderMale, &entity.Genders{Gender: "Male"})
   db.FirstOrCreate(&GenderFemale, &entity.Genders{Gender: "Female"})

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
       RoleID: 2,
   }
   db.FirstOrCreate(Member, &entity.User{
       Email: "SMTRUE@gmail.com",
   })
}

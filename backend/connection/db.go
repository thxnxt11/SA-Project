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
       &entity.Members{},
       &entity.Genders{},
       &entity.Organizer{},
       &entity.PromotionType{},
       &entity.Promotion{}, 
       &entity.Concert{},
       &entity.ShowDate{},  
       &entity.Venue{},
       &entity.Booking{},
       &entity.BookingStatus{},
       &entity.BookingSeat{},
       &entity.PaymentMethod{},
       &entity.PaymentStatus{},
       &entity.Payment{},
       &entity.Seat{},
       &entity.SeatCode{},
       &entity.Zone{},
       &entity.ZoneType{},
   )
   
   GenderMale := entity.Genders{Gender: "Male"}
   GenderFemale := entity.Genders{Gender: "Female"}

   db.FirstOrCreate(&GenderMale, &entity.Genders{Gender: "Male"})
   db.FirstOrCreate(&GenderFemale, &entity.Genders{Gender: "Female"})

   hashedPassword, _ := HashPassword("123456")
   BirthDay, _ := time.Parse("2006-01-02", "1988-11-12")
   Member := &entity.Members{
       FirstName: "Software",
       LastName:  "Analysis",
       Email:     "sa@gmail.com",
       Age:       80,
       Password:  hashedPassword,
       BirthDay:  BirthDay,
	   Phonenum:  "xxx-xxx-xxxx",
       GenderID:  1,
   }
   db.FirstOrCreate(Member, &entity.Members{
       Email: "sa@gmail.com",
   })
}
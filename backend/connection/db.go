package connection

import (
	"fmt"
	"time"

	"github.com/yourname/went-back/Entity"
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
       &Entity.Members{},
       &Entity.Genders{},
       &Entity.Refund{},
       &Entity.Bank{},
       &Entity.RefundStatus{},
       &Entity.Booking{},
       &Entity.Payment{},
       &Entity.Report{},
       &Entity.RefundStatus{},
       &Entity.ReportType{},
   )
   
   GenderMale := Entity.Genders{Gender: "Male"}
   GenderFemale := Entity.Genders{Gender: "Female"}

   db.FirstOrCreate(&GenderMale, &Entity.Genders{Gender: "Male"})
   db.FirstOrCreate(&GenderFemale, &Entity.Genders{Gender: "Female"})

   hashedPassword, _ := HashPassword("123456")
   BirthDay, _ := time.Parse("2006-01-02", "1988-11-12")
   User := &Entity.Members{
       FirstName: "Software",
       LastName:  "Analysis",
       Email:     "sa@gmail.com",
       Age:       80,
       Password:  hashedPassword,
       BirthDay:  BirthDay,
	   Phonenum:  "xxx-xxx-xxxx",
       GenderID:  1,
   }
   db.FirstOrCreate(User, &Entity.Members{
       Email: "sa@gmail.com",
   })
}
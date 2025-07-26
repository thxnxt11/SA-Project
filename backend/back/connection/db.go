package connection

import (
   "fmt"
   "time"
   "github.com/yourname/went-back/datastruct"
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
       &datastruct.Users{},
       &datastruct.Genders{},
   )
   
   GenderMale := datastruct.Genders{Gender: "Male"}
   GenderFemale := datastruct.Genders{Gender: "Female"}

   db.FirstOrCreate(&GenderMale, &datastruct.Genders{Gender: "Male"})
   db.FirstOrCreate(&GenderFemale, &datastruct.Genders{Gender: "Female"})

   hashedPassword, _ := HashPassword("123456")
   BirthDay, _ := time.Parse("2006-01-02", "1988-11-12")
   User := &datastruct.Users{
       FirstName: "Software",
       LastName:  "Analysis",
       Email:     "sa@gmail.com",
       Age:       80,
       Password:  hashedPassword,
       BirthDay:  BirthDay,
	   Phonenum:  "xxx-xxx-xxxx",
       GenderID:  1,
   }
   db.FirstOrCreate(User, &datastruct.Users{
       Email: "sa@gmail.com",
   })
}
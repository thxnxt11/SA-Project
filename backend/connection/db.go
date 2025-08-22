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

   db.FirstOrCreate(&entity.PromotionType{}, entity.PromotionType{
      PromotionType: "Early Bird",
   })
   db.FirstOrCreate(&entity.PromotionType{}, entity.PromotionType{
      PromotionType: "Code",
   })
   db.FirstOrCreate(&entity.PromotionType{}, entity.PromotionType{
      PromotionType: "Concert",
   })

   db.FirstOrCreate(&entity.ZoneType{}, entity.ZoneType{
      ZoneType: "Standing",
   })
   db.FirstOrCreate(&entity.ZoneType{}, entity.ZoneType{
      ZoneType: "Seating",
   })

   

   SeedSeatAvailable(DB())

   sql := `
		UPDATE seat_availables
		SET seat_available_status = 'Booked'
		WHERE rowid IN (
			SELECT rowid
			FROM seat_availables
			WHERE zone_id = ?
			LIMIT 10
		)
	`
	result := db.Exec(sql, 1)
   if result.Error != nil {
		panic(result.Error)
	}


   
}
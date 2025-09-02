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
        &entity.Cart{},
        &entity.Category{},
        &entity.Color{},
        &entity.Concert{},
        &entity.PaymentMedthod{},
        &entity.PaymentOrder{},
        &entity.PaymentStatus{},
        &entity.Product{},
        &entity.Variant{},
        &entity.Promotion{},
        &entity.Size{},
        &entity.Stockmovement{},
        &entity.User{},
        // &entity.Warehouse{},
        &entity.Genders{},
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

    // --- Concert ---
    concerts := []string{"World Tour", "Born To Be", "Big mountain", "4 King"}
    for _, c := range concerts {
        db.FirstOrCreate(&entity.Concert{}, entity.Concert{Concert: c})
    }

    // --- Payment Status ---
    statuses := []string{"Pending", "Paid", "Failed", "Refunded"}
    for _, st := range statuses {
        db.FirstOrCreate(&entity.PaymentStatus{}, entity.PaymentStatus{Status: st})
    }

    // --- Payment Methods ---
    methods := []string{"Credit Card", "Bank Transfer", "PromptPay"}
    for _, m := range methods {
        db.FirstOrCreate(&entity.PaymentMedthod{}, entity.PaymentMedthod{Method: m})
    }

    // --- Example Product ---
    db.FirstOrCreate(&entity.Product{}, entity.Product{
        ProductName:    "Once T-Shirt",
        CategoryID:     1,
        ProductDetail:  "The must have item for once",
        ProductPrice:   1299.00,
        Minimum:        100,
        Sales:          0,
        Total:          0,
        ConcertID:        1,
    })

    db.FirstOrCreate(&entity.Variant{}, entity.Variant{
        ProductID:    1,
        ColorID:     1,
        SizeID:  2,
        Quantity:  20,
        Picture:    "https://down-th.img.susercontent.com/file/sg-11134201-7ra21-mbfamov4c61958",

    })
}
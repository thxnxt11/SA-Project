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
    // ไฟล์ sa.db จะถูกสร้างใน folder backend
    database, err := gorm.Open(sqlite.Open("sa.db"), &gorm.Config{})
    if err != nil {
        panic("failed to connect database")
    }
    fmt.Println("connected database")
    db = database
}
    
func SetupDatabase() {
    db.AutoMigrate(
        &entity.Action{},
        &entity.Cart{},
        &entity.CartItem{},
        &entity.Category{},
        &entity.Color{},
        &entity.Concert{},
        &entity.PaymentMethod{},
        &entity.PaymentOrder{},
        &entity.PaymentStatus{},
        &entity.PromotionType{},
        &entity.Product{},
        &entity.Variant{},
        &entity.Promotion{},
        &entity.Size{},
        &entity.StockMovement{},
        &entity.User{},
        &entity.Role{},
        &entity.Position{},
        &entity.Department {},
        &entity.Genders{},
    )

    GenderMale := entity.Genders{Gender: "Male"}
    GenderFemale := entity.Genders{Gender: "Female"}

    db.FirstOrCreate(&GenderMale, &entity.Genders{Gender: "Male"})
    db.FirstOrCreate(&GenderFemale, &entity.Genders{Gender: "Female"})
    // role
    roles := []string{"organizer", "member", "admin", "staff"}
    for _, rol := range roles {
        db.FirstOrCreate(&entity.Role{}, entity.Role{Role: rol})
    }
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

    //promotion type
   db.FirstOrCreate(&entity.PromotionType{}, entity.PromotionType{
      PromotionType: "Code",
   })
   db.FirstOrCreate(&entity.PromotionType{}, entity.PromotionType{
      PromotionType: "Concert",
   })

    //PaymentMethod
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

    // --- Example Promotion ---
    startDate, _ := time.Parse("2006-01-02", "2025-09-01")
    endDate, _ := time.Parse("2006-01-02", "2025-09-30")
    db.FirstOrCreate(&entity.Promotion{}, entity.Promotion{
        PromotionName:   "PRODUCT10",
        Description:     "ลด 10% ",
        PromotionTypeId: 3, // Code
        PromotionCode:   "PRODUCT10",
        Discount:        10,
        StartDate:       startDate,
        EndDate:         endDate,
        Limit:           100,
        Status:          "active",
        UserID:          1,
        ConcertID:       1,
        Poster:          "",
    })
    
    // --- Action ---
    action := []string{"IN", "OUT", "UPDATE"}
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

    // --- Concert ---
    concerts := []string{"World Tour", "Born To Be", "Big mountain", "4 King"}
    for _, c := range concerts {
        db.FirstOrCreate(&entity.Concert{}, entity.Concert{Concert: c})
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
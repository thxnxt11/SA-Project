package connection

import (
	"fmt"
	"github.com/yourname/went-back/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"time"
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
		&entity.Department{},
		&entity.Venue{},
		&entity.Concert{},
		&entity.Stage{},
		&entity.StageEquipment{},
		&entity.StageType{},
		&entity.VenueType{},
		&entity.Equipment{},
		&entity.EquipmentType{},
		&entity.EquipmentStatus{},
		&entity.Position{},
		&entity.Assignment{},
		&entity.AssignmentStatus{},
		&entity.ShowDate{},
		&entity.StaffAssignment{},
	)

	// ===== Gender =====
	male := entity.Genders{Gender: "Male"}
	female := entity.Genders{Gender: "Female"}
	db.FirstOrCreate(&male, &entity.Genders{Gender: "Male"})
	db.FirstOrCreate(&female, &entity.Genders{Gender: "Female"})

	// ===== Roles =====
	db.FirstOrCreate(&entity.Role{}, &entity.Role{Role: "Oganizer"})
	db.FirstOrCreate(&entity.Role{}, &entity.Role{Role: "Member"})
	db.FirstOrCreate(&entity.Role{}, &entity.Role{Role: "Admin"})
	db.FirstOrCreate(&entity.Role{}, &entity.Role{Role: "Staff"})

	// ===== Departments =====
	db.FirstOrCreate(&entity.Department{}, &entity.Department{Department: "Marketing"})      // โปรโมท, PR, สื่อสาร
	db.FirstOrCreate(&entity.Department{}, &entity.Department{Department: "Technical"})      // แสง, เสียง, เวที
	db.FirstOrCreate(&entity.Department{}, &entity.Department{Department: "Logistics"})      // ขนส่ง, จัดการอุปกรณ์
	db.FirstOrCreate(&entity.Department{}, &entity.Department{Department: "Production"})     // วางแผนการแสดง, schedule
	db.FirstOrCreate(&entity.Department{}, &entity.Department{Department: "Security"})       // รปภ., คุม crowd
	db.FirstOrCreate(&entity.Department{}, &entity.Department{Department: "Hospitality"})    // ดูแลศิลปิน, VIP, catering
	db.FirstOrCreate(&entity.Department{}, &entity.Department{Department: "Finance"})        // บัญชี, ตั๋ว, สัญญา
	db.FirstOrCreate(&entity.Department{}, &entity.Department{Department: "Administration"}) // งานธุรการ, เอกสาร, อนุมัติ

	// ===== Positions =====
	db.FirstOrCreate(&entity.Position{}, &entity.Position{Position: "Leader"})
	db.FirstOrCreate(&entity.Position{}, &entity.Position{Position: "Manager"})
	db.FirstOrCreate(&entity.Position{}, &entity.Position{Position: "Staff"})
	db.FirstOrCreate(&entity.Position{}, &entity.Position{Position: "Assistant"})

	// ===== Assignment Statuses =====
	db.FirstOrCreate(&entity.AssignmentStatus{}, &entity.AssignmentStatus{AssignmentStatus: "Pending"})
	db.FirstOrCreate(&entity.AssignmentStatus{}, &entity.AssignmentStatus{AssignmentStatus: "In Progress"})
	db.FirstOrCreate(&entity.AssignmentStatus{}, &entity.AssignmentStatus{AssignmentStatus: "Completed"})
	db.FirstOrCreate(&entity.AssignmentStatus{}, &entity.AssignmentStatus{AssignmentStatus: "Cancelled"})

	// ===== Equipment Statuses =====
	db.FirstOrCreate(&entity.EquipmentStatus{}, &entity.EquipmentStatus{EquipmentStatus: "Available"})
	db.FirstOrCreate(&entity.EquipmentStatus{}, &entity.EquipmentStatus{EquipmentStatus: "In Use"})
	db.FirstOrCreate(&entity.EquipmentStatus{}, &entity.EquipmentStatus{EquipmentStatus: "Under Maintenance"})
	db.FirstOrCreate(&entity.EquipmentStatus{}, &entity.EquipmentStatus{EquipmentStatus: "Out of Order"})

	// ===== Equipment Types =====
	db.FirstOrCreate(&entity.EquipmentType{}, &entity.EquipmentType{EquipmentType: "Audio"})
	db.FirstOrCreate(&entity.EquipmentType{}, &entity.EquipmentType{EquipmentType: "Lighting"})

	// ===== Stage Types =====
	db.FirstOrCreate(&entity.StageType{}, &entity.StageType{StageType: "Hybrid"})	
	db.FirstOrCreate(&entity.StageType{}, &entity.StageType{StageType: "Modular"})
	db.FirstOrCreate(&entity.StageType{}, &entity.StageType{StageType: "Theater"})
	db.FirstOrCreate(&entity.StageType{}, &entity.StageType{StageType: "Arena"})
	db.FirstOrCreate(&entity.StageType{}, &entity.StageType{StageType: "Festival"})
	db.FirstOrCreate(&entity.StageType{}, &entity.StageType{StageType: "Concert"})
	db.FirstOrCreate(&entity.StageType{}, &entity.StageType{StageType: "Catwalk"})
	db.FirstOrCreate(&entity.StageType{}, &entity.StageType{StageType: "Virtual"})
	db.FirstOrCreate(&entity.StageType{}, &entity.StageType{StageType: "TV/Film Set"})
	
	// ===== Venue Types =====
	db.FirstOrCreate(&entity.VenueType{}, &entity.VenueType{VenueType: "Theater"})
	db.FirstOrCreate(&entity.VenueType{}, &entity.VenueType{VenueType: "Stadium"})
	db.FirstOrCreate(&entity.VenueType{}, &entity.VenueType{VenueType: "Concert Hall"})
	db.FirstOrCreate(&entity.VenueType{}, &entity.VenueType{VenueType: "Club"})
	db.FirstOrCreate(&entity.VenueType{}, &entity.VenueType{VenueType: "Outdoor Arena"})
	db.FirstOrCreate(&entity.VenueType{}, &entity.VenueType{VenueType: "Festival Grounds"})
	db.FirstOrCreate(&entity.VenueType{}, &entity.VenueType{VenueType: "Conference Center"})
	db.FirstOrCreate(&entity.VenueType{}, &entity.VenueType{VenueType: "Banquet Hall"})
	db.FirstOrCreate(&entity.VenueType{}, &entity.VenueType{VenueType: "Museum/Gallery"})
	db.FirstOrCreate(&entity.VenueType{}, &entity.VenueType{VenueType: "Religious Venue"})
	db.FirstOrCreate(&entity.VenueType{}, &entity.VenueType{VenueType: "Virtual Venue"})

// ===== Sample Concerts =====
concert1 := entity.Concert{
	ConcertName: "Summer Music Fest",
	VenueID:     21,
}
db.FirstOrCreate(&concert1, entity.Concert{ConcertName: concert1.ConcertName})

concert2 := entity.Concert{
	ConcertName: "Rock Night",
	VenueID:     22,
}
db.FirstOrCreate(&concert2, entity.Concert{ConcertName: concert2.ConcertName})

// ===== Sample ShowDates =====
showDates := []entity.ShowDate{
	// Summer Music Fest
	{
		ConcertID: concert1.ID,
		VenueID:   concert1.VenueID,
		ShowDate:  time.Date(2025, 7, 10, 19, 0, 0, 0, time.UTC),
	},
	{
		ConcertID: concert1.ID,
		VenueID:   concert1.VenueID,
		ShowDate:  time.Date(2025, 7, 11, 19, 0, 0, 0, time.UTC),
	},
	{
		ConcertID: concert1.ID,
		VenueID:   concert1.VenueID,
		ShowDate:  time.Date(2025, 7, 12, 19, 0, 0, 0, time.UTC),
	},
	// Rock Night
	{
		ConcertID: concert2.ID,
		VenueID:   concert2.VenueID,
		ShowDate:  time.Date(2025, 8, 5, 20, 0, 0, 0, time.UTC),
	},
}

// Insert ShowDates ให้พร้อมใช้งาน Assign
for _, s := range showDates {
	db.FirstOrCreate(&s, entity.ShowDate{ConcertID: s.ConcertID, ShowDate: s.ShowDate})
}

	// ===== Default Admin User =====
	var maleGender entity.Genders
	var adminRole entity.Role
	var technicalDept entity.Department
	var managerPos entity.Position

	db.First(&maleGender, "gender = ?", "Male")
	db.First(&adminRole, "role = ?", "Admin")
	db.First(&technicalDept, "department = ?", "Administration")
	db.First(&managerPos, "position = ?", "Leader")

	hashedPassword, _ := HashPassword("admin123") // หรือเรียกฟังก์ชัน HashPassword
	birthday, _ := time.Parse("2006-01-02", "1980-01-01")

	adminUser := entity.User{
		FirstName:    "Admin",
		LastName:     "NongMos",
		Email:        "adminnongmos@gmail.com",
		Password:     hashedPassword,
		BirthDay:     birthday,
		Address:      "ที่บ้าน",
		Phonenumber:  "000-0000-0000",
		GenderID:     maleGender.ID,
		RoleID:       adminRole.ID,
		DepartmentID: technicalDept.ID,
		PositionID:   managerPos.ID,
	}

	db.FirstOrCreate(&adminUser, entity.User{Email: "adminnongmos@gmail.com"})

	
}

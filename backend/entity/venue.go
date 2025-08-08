package entity
import(
	"gorm.io/gorm"
)

type Venue struct {
	gorm.Model
	VenueName string `json:"venue_name"`
}
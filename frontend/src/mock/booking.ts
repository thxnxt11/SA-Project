export const mockBookingDetails = {
  concert: {
    // name: "2025 NCT DREAM TOUR THE DREAM SHOW 4 in BANGKOK",
    // artist: "NCT DREAM",
    name: "2025 AESPA TOUR SYNK: AEXIS LINE IN BANGKOK",
    artist: "AESPA",
    date: "19 February 2026", // Placeholder, will be overridden by location.state
    time: "19.00", // Placeholder, will be overridden by location.state
    venue: "Rajamangala National Stadium",
  },
  member: {
    firstname: "Tan",
    lastname: "Thanat",
    email: "test234@gmail.com",
    tel: "0987654321",
  },
  // Mock discount codes
  discounts: [
    {
      code: "TEST5",
      type: "percentage",
      value: 5,
      message: "Valid discount code, get discount 5%",
    },
    {
      code: "TEST100",
      type: "fixed",
      value: 100,
      message: "Valid discount code, get discount 100 THB",
    },
  ],
};

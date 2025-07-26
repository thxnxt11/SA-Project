package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Nickname string `json:"nickname"`
}

func sign_in(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	var us User
	if err := json.NewDecoder(r.Body).Decode(&us); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	//test here
	fmt.Printf("%s %s %s", us.Username, us.Password, us.Nickname)
	//dont test below

	db, err := sql.Open("sqlite3", `C:\Users\tham\Documents\sqliteproject\member.db`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	var exists string
	err = db.QueryRow("SELECT username FROM Member WHERE username = ?", us.Username).
		Scan(&exists)
	if err != nil && err != sql.ErrNoRows {
		http.Error(w, "Query error", http.StatusInternalServerError)
		return
	}
	if exists != "" {
		fmt.Fprint(w, "this username already in use")
		return
	}

	if _, err := db.Exec(
		"INSERT INTO Member (username, password, nickname) VALUES (?, ?, ?)",
		us.Username, us.Password, us.Nickname,
	); err != nil {

		http.Error(w, "Insert error", http.StatusInternalServerError)
		return
	}

	fmt.Fprint(w, "create account successfuly, please go to log in page")
}

func log_in(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	var us User
	if err := json.NewDecoder(r.Body).Decode(&us); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	fmt.Printf("%s %s %s", us.Nickname, us.Password, us.Username)

	db, err := sql.Open("sqlite3", `C:\Users\tham\Documents\sqliteproject\member.db`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer db.Close()
	
	var exists string
	err = db.QueryRow(
		"SELECT username FROM Member WHERE username = ? AND password = ?",
		us.Username, us.Password,
	).Scan(&exists)

	if err == sql.ErrNoRows {
		fmt.Fprint(w, "invalid username or password|0")
		return
	} else if err != nil {
		http.Error(w, "Query error", http.StatusInternalServerError)
		return
	}

	fmt.Fprint(w, "login successful welcome back", us.Nickname)

}

func main() {
	http.HandleFunc("/api/sendsign", sign_in)
	http.HandleFunc("/api/sendlog", log_in)
	http.ListenAndServe(":8000", nil)
}

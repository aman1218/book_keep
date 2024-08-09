package db

import (
	"database/sql"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID           int    `json:"id"`
	Username     string `json:"username"`
	PasswordHash string `json:"password_hash"`
	Email        string `json:"email"`
}

type Book struct {
	ID        	int    `json:"id"`
	Name 		string `json:"name"`
	Author 		string `json:"author"`
	Publisher 	string `json:"publisher"`
	IsBorrowed  bool   `json:"is_borrowed"`
}


func Authenticate(username, password string) (*User, error) {
	row := db.QueryRow("SELECT id, username, password_hash FROM users WHERE username=$1", username)
	var user User
	err := row.Scan(&user.ID, &user.Username, &user.PasswordHash)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		fmt.Println("Error getting user by username:", err)
		return nil, err
	}
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func Register(username, password, email string) (*User, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	row := db.QueryRow("INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3) RETURNING id", username, string(hash), email)
	var user User
	err = row.Scan(&user.ID)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func GetAllBooks() ([]Book, error) {
    rows, err := db.Query("SELECT id, name, author, publisher, is_borrowed FROM books")
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    var books []Book
    for rows.Next() {
        var b Book
        if err := rows.Scan(&b.ID, &b.Name, &b.Author, &b.Publisher, &b.IsBorrowed); err != nil {
            return nil, err
        }
        books = append(books, b)
    }
    return books, nil
}

func GetBookByID(id int) (Book, error) {
    var b Book
    row := db.QueryRow("SELECT id, name, author, publisher FROM books WHERE id = $1", id)
    if err := row.Scan(&b.ID, &b.Name, &b.Author, &b.Publisher); err != nil {
        return b, err
    }
    return b, nil
}

func CreateBook(b Book) (int, error) {
    var id int
    err := db.QueryRow("INSERT INTO books (name, author, publisher) VALUES ($1, $2, $3) RETURNING id", b.Name, b.Author, b.Publisher).Scan(&id)
    if err != nil {
        return 0, err
    }
    return id, nil
}

func UpdateBook(b Book) error {
    _, err := db.Exec("UPDATE books SET name = $1, author = $2, publisher = $3 WHERE id = $4", b.Name, b.Author, b.Publisher, b.ID)
    return err
}

func DeleteBook(id int) error {
    _, err := db.Exec("DELETE FROM books WHERE id = $1", id)
    return err
}

func BorrowBook(id int) error {
    _, err := db.Exec("UPDATE books SET is_borrowed = TRUE WHERE id = $1", id)
    return err
}

func ReturnBook(id int) error {
    _, err := db.Exec("UPDATE books SET is_borrowed = FALSE WHERE id = $1", id)
    return err
}	
package routes

import (
	"github.com/aman1218/book_keep/api"
	"github.com/aman1218/book_keep/db"
	"github.com/aman1218/book_keep/middleware"
	"github.com/gorilla/mux"
)

func Router() *mux.Router {

	r := mux.NewRouter()

	// Middleware
	r.Use(middleware.LoggingMiddleware)
	r.Use(middleware.CORSMiddleware)

	// Public routes
	r.HandleFunc("/login", api.LoginHandler).Methods("POST")
	r.HandleFunc("/register", api.RegisterHandler).Methods("POST")
	r.HandleFunc("/books", api.ListBooksHandler).Methods("GET")
	r.HandleFunc("/books", api.CreateBookHandler).Methods("POST")
	r.HandleFunc("/books/{id}", api.GetBookHandler).Methods("GET")
	r.HandleFunc("/books/{id}", api.UpdateBookHandler).Methods("PUT")
	r.HandleFunc("/books/{id}", api.DeleteBookHandler).Methods("DELETE")
	r.HandleFunc("/books/borrow/{id}", api.BorrowBookHandler).Methods("POST")
    r.HandleFunc("/books/return/{id}", api.ReturnBookHandler).Methods("POST")

	// Initialize database connection
	db.InitDB()
	return r
}

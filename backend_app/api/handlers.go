package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/aman1218/book_keep/db"
	"github.com/aman1218/book_keep/middleware"
	"github.com/gorilla/mux"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	user, err := db.Authenticate(req.Username, req.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	token, err := middleware.GenerateJWT(user.ID)
	if err != nil {
		http.Error(w, "Could not generate token", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"token": token})
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
		Email    string `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	user, err := db.Register(req.Username, req.Password, req.Email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	token, err := middleware.GenerateJWT(user.ID)
	if err != nil {
		http.Error(w, "Could not generate token", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"token": token})
}

func ListBooksHandler(w http.ResponseWriter, r *http.Request) {
	books, err := db.GetAllBooks()
	if err != nil {
		http.Error(w, "Failed to retrieve books", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(books)
}

func GetBookHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}
	book, err := db.GetBookByID(id)
	if err != nil {
		http.Error(w, "Failed to retrieve book", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(book)
}

func CreateBookHandler(w http.ResponseWriter, r *http.Request) {
	var b db.Book
	if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	id, err := db.CreateBook(b)
	if err != nil {
		http.Error(w, "Failed to create book", http.StatusInternalServerError)
		return
	}
	b.ID = id
	json.NewEncoder(w).Encode(b)
}

func UpdateBookHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}
	var b db.Book
	b.ID = id
	if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if err := db.UpdateBook(b); err != nil {
		http.Error(w, "Failed to update book", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(b)
}

func DeleteBookHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}
	if err := db.DeleteBook(id); err != nil {
		http.Error(w, "Failed to delete book", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func BorrowBookHandler(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	err = db.BorrowBook(id)
	if err != nil {
		http.Error(w, "Error borrowing book", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Book borrowed successfully"))
}

func ReturnBookHandler(w http.ResponseWriter, r *http.Request) {

    vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	err = db.ReturnBook(id)
	if err != nil {
		http.Error(w, "Error returning book", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Book returned successfully"))
}

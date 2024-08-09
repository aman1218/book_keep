import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Ensure the path is correct

function Dashboard({ onLogout }) {
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [editBook, setEditBook] = useState(null);
    const [newBook, setNewBook] = useState({ name: '', author: '', publisher: '' });
    const [newName, setNewName] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = () => {
        setIsLoading(true);
        setError('');
        const token = localStorage.getItem('jwt');
        axios.get('/books', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            const sortedBooks = response.data.sort((a, b) => a.name.localeCompare(b.name));
            setBooks(sortedBooks);
            setIsLoading(false);
        })
        .catch(error => {
            console.error('Error fetching books:', error);
            setError('Failed to fetch books');
            setIsLoading(false);
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        });
    };

    const borrowBook = (id) => {
        const token = localStorage.getItem('jwt');
        axios.post(`/books/borrow/${id}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
            console.log("Book borrowed!");
            fetchBooks(); // Refresh the book list
        })
        .catch(error => {
            console.error('Error borrowing book:', error);
        });
    };

    const returnBook = (id) => {
        const token = localStorage.getItem('jwt');
        axios.post(`/books/return/${id}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
            console.log("Book returned!");
            fetchBooks(); // Refresh the book list
        })
        .catch(error => {
            console.error('Error returning book:', error);
        });
    };

    const updateBookName = (id) => {
        const token = localStorage.getItem('jwt');
        // Fetch the current book data
        axios.get(`/books/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            const updatedBook = { ...response.data, name: newName }; // Update the name while keeping other fields intact
            // Send the updated book data back to the server
            return axios.put(`/books/${id}`, updatedBook, {
                headers: { Authorization: `Bearer ${token}` }
            });
        })
        .then(() => {
            console.log("Book name updated!");
            setEditBook(null);
            setNewName('');
            fetchBooks(); // Refresh the book list
        })
        .catch(error => {
            console.error('Error updating book name:', error);
        });
    };

    const deleteBook = (id) => {
        const token = localStorage.getItem('jwt');
        axios.delete(`/books/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
            console.log("Book deleted!");
            fetchBooks(); // Refresh the book list
        })
        .catch(error => {
            console.error('Error deleting book:', error);
        });
    };

    const openEditModal = (book) => {
        setEditBook(book);
        setNewName(book.name);
    };

    const closeEditModal = () => {
        setEditBook(null);
        setNewName('');
    };

    const openAddModal = () => {
        setNewBook({ name: '', author: '', publisher: '' });
        setShowAddModal(true);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
    };

    const handleAddBook = () => {
        const token = localStorage.getItem('jwt');
        axios.post('/books', newBook, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
            console.log("Book added!");
            setShowAddModal(false);
            fetchBooks(); // Refresh the book list
        })
        .catch(error => {
            console.error('Error adding book:', error);
        });
    };

    return (
        <div className="container">
            <div className="button-group">
                <button onClick={onLogout} className="button">Logout</button>
                <button onClick={openAddModal} className="button add-button">Add Book</button>
            </div>
            <h1 className="header">Welcome to Library</h1>
            {isLoading ? (
                <p>Loading books...</p>
            ) : error ? (
                <p>{error}</p>
            ) : books.length > 0 ? (
                <div>
                    <h2 className="sub-header">Available Books in Library</h2>
                    <div className="books-list">
                        {books.map(book => (
                            <div key={book.id} className="book-item">
                                <p><strong>Title:</strong> {book.name}</p>
                                <p><strong>Author:</strong> {book.author}</p>
                                <p><strong>Publisher:</strong> {book.publisher}</p>
                                {book.is_borrowed ? (
                                    <button onClick={() => returnBook(book.id)} className="button return-button">Return</button>
                                ) : (
                                    <button onClick={() => borrowBook(book.id)} className="button borrow-button">Borrow</button>
                                )}
                                <button onClick={() => openEditModal(book)} className="button update-button">Update</button>
                                <button onClick={() => deleteBook(book.id)} className="button delete-button">Delete</button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p>No books available.</p>
            )}
            {editBook && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeEditModal}>&times;</span>
                        <h2>Edit Book Name</h2>
                        <input 
                            type="text" 
                            value={newName} 
                            onChange={(e) => setNewName(e.target.value)} 
                        />
                        <div className="modal-buttons">
                            <button onClick={() => updateBookName(editBook.id)} className="button update-button">Save</button>
                            <button onClick={closeEditModal} className="button delete-button">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {showAddModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeAddModal}>&times;</span>
                        <h2>Add New Book</h2>
                        <input 
                            type="text" 
                            placeholder="Book Name"
                            value={newBook.name} 
                            onChange={(e) => setNewBook({ ...newBook, name: e.target.value })} 
                        />
                        <input 
                            type="text" 
                            placeholder="Author"
                            value={newBook.author} 
                            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })} 
                        />
                        <input 
                            type="text" 
                            placeholder="Publisher"
                            value={newBook.publisher} 
                            onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })} 
                        />
                        <div className="modal-buttons">
                            <button onClick={handleAddBook} className="button add-button">Add</button>
                            <button onClick={closeAddModal} className="button delete-button">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;

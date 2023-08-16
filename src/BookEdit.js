import React, { useState, useRef, useEffect, useContext } from "react"
import BooksContext from './context/books';

function BookEdit({ book, onSubmit }) {
  const [title, setTitle] = useState(book.title);

  const { editBookById } = useContext(BooksContext)

  const ref = useRef(null);

  useEffect(() => {
    ref.current.focus();
  }, []);

  const handleInputChange = (event) => {
    setTitle(event.target.value);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
    editBookById(book.id, title);
  }

  return (
    <div>
      <form className="book-edit" onSubmit={handleSubmit}>
        <label>Title</label>
        <input type="text" ref={ref} className="input" value={title} onChange={handleInputChange} />
        <button className="button is-primary">Save</button>
      </form>
    </div>
  )
}

export default BookEdit

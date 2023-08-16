import React, {useState, useContext} from 'react'
import BooksContext from './context/books';

function BookCreate() {
  const [title, setTitle] = useState('');

  const { createBook } = useContext(BooksContext);

  const handleChange = (event) => {
    setTitle(event.target.value);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    createBook(title);
    setTitle('');
  }

  return (
    <div className='book-create'>
      <h3>Add a Book</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="addBook">Title</label>
        <input type="text" id='addBook' 
          value={title}
          className='input'
          onChange={handleChange}
          required
        />
        <button className='button'>Add Book</button>
      </form>
    </div>
  )
}

export default BookCreate

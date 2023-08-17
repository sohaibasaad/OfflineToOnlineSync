// import React, { useEffect, useContext } from 'react'
// import BookCreate from './BookCreate'
// import BookList from './BookList'
// import IndexDb from './IndexDb'
// import './library.css'
// import BooksContext from './context/books'

// function App4Main() {

//   const {fetchBooks} = useContext(BooksContext);

//   useEffect(() => {
//     fetchBooks();
//   }, []);

//   return (
//     <div className='app'>
//       <h1>Reading List</h1>
//       {/* <BookCreate />
//       <BookList /> */}
//       <IndexDb />
//     </div>
//   )
// }

// export default App4Main


import React, { useState, useEffect } from 'react';
import Dexie from 'dexie';

const db = new Dexie('OfflineToOnlineSync');
db.version(1).stores({
  offlineData: '++id, data, status', // status: unsynchronized, pending, synchronized
  // onlineDatabase: '++id, data, status' // Adding new table to database
});


function App() {
  const [online, setOnline] = useState(window.navigator.onLine);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    synchronizeData(); // Initial sync attempt when app loads
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleOnline = () => {
    setOnline(true);
    synchronizeData();
  };

  const handleOffline = () => {
    setOnline(false);
  };

  const synchronizeData = async () => {
    console.log("synchronizing start")

    // If user is offline
    if (!online) {
      return;
    }

    try {
      const unsynchronizedData = await db.offlineData.where({ status: 'unsynchronized' }).toArray(); // get all the data that is unsynchronized

      // check if there is no unsynchronized data
      if (unsynchronizedData.length === 0) {
        console.log('No unsynchronized data to sync.');
        return;
      }

      const batchSize = 5; // size of the batch to send to API
      let currentIndex = 0;

      while (currentIndex < unsynchronizedData.length) {
        const batch = unsynchronizedData.slice(currentIndex, currentIndex + batchSize);
        const response = await sendToServerAPI(batch);
        for (const item of batch) {
          try {
            //If API returns success
            if (response.status === 201) {
              await db.offlineData.update(item.id, { status: 'synchronized' });
            }
          } catch (error) {
            console.error('Error syncing item:', error);
            // Handle error or retry logic
          }
        }
        currentIndex += batchSize;
      }
      console.log("synchronizing end")
    } catch (error) {
      console.error('Error getting unsynchronized data:', error);
    }
  };

  const sendToServerAPI = async (data) => {
    try {
      const response = await fetch('http://127.0.0.1:3001/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      throw new Error('Failed to send data to server.');
    }
  };

  const addToOfflineStorage = async (data) => {
    await db.offlineData.add({ data, status: 'unsynchronized' });
    // let dataNew =           {
    //   "title": "Developersssss",
    //   "author": "Author by developerssss"
    // }
    // await db.onlineDatabase.add({ dataNew, status: 'unsynchronized' });
  };

  return (
    <div style={
      {
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center'
      }
    }>
      <h1 style={
        {
          textAlign: 'center',
          marginTop: '20px',
          fontFamily: 'Poppins'
        }
      }>Offline Data Storage and Synchronization</h1>

      {online ?
        <span style={
          {
            textAlign: 'center',
            marginTop: '20px',
            display: 'block',
            fontFamily: 'Poppins'
          }
        }>Switch Off Internet</span>
        :
        <button onClick={() => addToOfflineStorage(
          {
            "title": "Developer",
            "author": "Author by developer"
          }
        )} style={
          {
            backgroundColor: '#0d6efd',
            border: 'none',
            textAlign: 'center',
            marginTop: '20px',
            display: 'block',
            margin: '20px auto 0',
            padding: '10px',
            borderRadius: '10px',
            color: 'white',
            fontFamily: 'Poppins'
          }
        }>Add Offline Data</button>}

      <p style={
        {
          textAlign: 'center',
          marginTop: '20px',
          fontFamily: 'Poppins'
        }
      }>Status: <span style={{ fontWeight: '600' }}>{online ? 'Online' : 'Offline'}</span>
      </p>
    </div>
  );
}

export default App;

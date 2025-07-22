import { useState } from 'react'
import axios from 'axios'
import { useEffect } from 'react'

function App() {
  const [jokes, setJokes] = useState([])
useEffect(() => {
    axios.get('/api/jokes') // Fetching jokes from the backend server just like an api fetch call. this service is just like fetch() from JS but it is more powerful and easy to use for cors.
      .then((response) => {
        setJokes(response.data);
      }) 
      .catch((error) => {
        console.error('Error fetching jokes:', error);
      });
  }, []);
  return (
    <>
    <h1>This is frontend part of the full stack Application</h1><br></br> 
    <h2>There are currently {jokes.length} Jokes from the backend:</h2>

    <ul>
      {jokes.map((jokes, index) => (
        <div key={jokes.id}>
          <h3>{jokes.title}</h3>
          <p>{jokes.content}</p>
        </div>
      ))}
    </ul>

    </>
  )
}

export default App

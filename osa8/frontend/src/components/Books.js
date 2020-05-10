import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../graphql/queries'



const Books = (props) => {
  const [genreFilter, setGenreFilter] = useState()
  const result = useQuery(ALL_BOOKS, {
    variables: { genre: genreFilter }
  })
  if (!props.show || result.loading) {
    return null
  }
  const genreClickHandler = name => e => setGenreFilter(name)
  const books = result.data.allBooks

  return (
    <div>
      <h2>books</h2>
      current filter: {genreFilter}
      <button onClick={genreClickHandler(undefined)}>Clear filter</button>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
              <td>{a.genres.map(g => (<a onClick={genreClickHandler(g)}>{g} </a>))}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Books

import React, { useRef } from 'react'

import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS } from '../graphql/queries'
import { EDIT_AUTHOR } from '../graphql/mutations'

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS)
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })
  const authorSelect = useRef(null)
  const bornInput = useRef(null)

  if (!props.show || result.loading) {
    return null
  }
  const authors = result.data.allAuthors

  const updateAuthor = () => {
    editAuthor({ variables: { name: authorSelect.current.value, born: parseInt(bornInput.current.value) } })
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      <h2>Set birthyear</h2>
      name: <select ref={authorSelect} >
        {authors.map(a =>
          <option value={a.name}>{a.name}</option>
        )}
      </select>
      born: <input ref={bornInput}></input>
      <button onClick={updateAuthor}>Update author</button>
    </div >
  )
}

export default Authors


import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'

import {
  useQuery, useMutation, useSubscription, useApolloClient, gql
} from '@apollo/client'
import { ALL_BOOKS, ALL_AUTHORS } from './graphql/queries'


export const BOOK_ADDED = gql`
subscription {
  bookAdded {
    title
    author {
      name
    }
    published
    genres
  }
}`


const App = ({ client }) => {

  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(localStorage.getItem('toksu'))
  const logout = () => {
    localStorage.removeItem('toksu')
    setToken(null)
  }
  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) =>
      set.map(p => p.title).includes(object.title)

    const dataInStore = client.readQuery({ query: ALL_BOOKS })
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks: dataInStore.allBooks.concat(addedBook) }
      })
    }
    const authordata = client.readQuery({ query: ALL_AUTHORS })
    console.log(addedBook)
    console.log(authordata)
    const oldauthordata = authordata.allAuthors
      .find(a => a.name == addedBook.author.name)
      || { name: addedBook.author.name, bookCount: 0, born: null }
    const newauthordata =
      authordata.allAuthors.filter(a => a != oldauthordata)
        .concat({
          ...oldauthordata,
          bookCount: oldauthordata.bookCount + 1
        })
    console.log(newauthordata)

    client.writeQuery({
      query: ALL_AUTHORS,
      data: { allAuthors: newauthordata },
    })

  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      alert(`${addedBook.title} added`)
      updateCacheWith(addedBook)
    }
  })

  return (
    <div>
      <div>
        {token ? <button onClick={logout}>logout</button> : <button onClick={() => setPage('login')}>login</button>}
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? <button onClick={() => setPage('add')}>add book</button> : null}
      </div>

      <Authors
        show={page === 'authors'}
      />

      <Books
        show={page === 'books'}
      />
      {
        token ? < NewBook
          show={page === 'add'}
        /> : null
      }


      <Login
        show={page === 'login'}
        setToken={setToken}
      />

    </div>
  )
}

export default App
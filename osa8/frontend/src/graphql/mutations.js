import { gql } from '@apollo/client'
export const CREATE_BOOK = gql`
  mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]) {
    addBook(
      title: $title,
      author: $author,
      published: $published
      genres: $genres
    ){
      title
    }
  }
`
export const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $born: Int!) {
    editAuthor(name: $name, setBornTo: $born) {
      name
    }
  }
`
export const LOGIN = gql`
  mutation login($name: String!, $password: String!) {
    login(name: $name, password: $password)
  }
`
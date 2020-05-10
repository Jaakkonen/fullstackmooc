const { ApolloServer, gql, UserInputError, PubSub } = require('apollo-server')
const { v4: uuid } = require('uuid');
const mongoose = require('mongoose')
const { Author, Book, User } = require('./db')
const bcrypt = require('bcryptjs');
mongoose.connect('mongodb://db:27017/test')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'a very-secret haxhaxhaxjwt security Token11231 ebin :-DDD ylilauta'
const pubsub = new PubSub()

const typeDefs = gql`
  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String!]!
    id: ID!
  }
  type Author {
    name: String
    bookCount: Int
    born: Int
  }
  type Query {
    
    bookCount: Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book]
    allAuthors: [Author!]!
  }
  type Mutation {
    token: String
    addBook(
      title: String
      author: String
      published: Int
      genres: [String]
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(name: String!, password: String!): Boolean
    login(name: String!, password: String!): String
  }
  type Subscription {
    bookAdded: Book!
  }
`

const resolvers = {
  Query: {
    bookCount: () => Book.count(),
    //authorCount: () => (new Set(books.map(_ => _.author))).size,
    authorCount: () => Author.count(),
    allBooks: async (root, { author, genre }) =>
      (await Book.find({
      }).populate('author').exec()).filter(_ => (!author || _.author.name == author) && (!genre || _.genres.includes(genre)))
    ,
    allAuthors: async () =>
      (await Author.find().exec()).map(_ => ({ ..._.toObject(), bookCount: Book.count({ author: _.id }) }))

  },
  Mutation: {
    addBook: async (root, { title, author, published, genres }, { user }) => {
      if (!user) throw new UserInputError("Login required")

      authorModel =
        await Author.findOne({ name: author }).exec()
        || await new Author({ name: author }).save().catch(e => { throw new UserInputError(e.message) })

      const bookmodel = new Book({ title, author: authorModel, published, genres });
      await bookmodel.save().catch(e => { throw new UserInputError(e.message) })
      pubsub.publish('BOOK_ADDED', { bookAdded: bookmodel })
      return bookmodel
    },
    editAuthor: async (root, { name, setBornTo }, { user }) => {
      if (!user) throw new UserInputError("Login required")

      const author = await Author.findOne({ name }).exec()
      if (!author) return null
      author.born = setBornTo
      await author.save().catch(e => { throw new UserInputError(e.message) })
      return author
    },
    createUser: async (root, { name, password }) => {
      // I do not like fixed passwords. Do it properly :)
      const user = await new User({ name, password_hash: bcrypt.hashSync(password) }).save().catch(e => { throw new UserInputError(e.message) })
      return true
    },
    login: async (root, { name, password }) => {
      const user = await User.findOne({ name }).exec()
      if (!user || !bcrypt.compareSync(password, user.password_hash))
        throw new UserInputError("Username of password invalid")
      return jwt.sign({ username: name }, JWT_SECRET)
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
      const user = await User.find({ name: decodedToken.username })
      return { user }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})

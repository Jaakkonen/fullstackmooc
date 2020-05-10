import React, { useRef } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../graphql/mutations'


const Login = ({ show, setToken }) => {
  const [login] = useMutation(LOGIN)
  const name = useRef(null)
  const pwd = useRef(null)
  if (!show) {
    return null
  }
  const loginHandle = async () => {
    const res = await login({ variables: { name: name.current.value, password: pwd.current.value } })
    setToken(res.data.login)
    localStorage.setItem('toksu', res.data.login)
  }
  return (
    < div >
      username: <input ref={name} />
      password: <input ref={pwd} />
      <button onClick={loginHandle}>login</button>
    </div >
  )
}

export default Login
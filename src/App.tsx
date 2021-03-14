import React, { useState, useEffect } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { withAuthenticator } from '@aws-amplify/ui-react'
import { v4 as uuid } from 'uuid'
import './App.css'
import awsExports from './aws-exports'
import { listTodos } from './graphql/queries'
import { createTodo, deleteTodo } from './graphql/mutations'

Amplify.configure(awsExports)

const initialFormState = { name: '', description: '' }

interface todo {
  id: string
  name: string
  description: string
}

const App = () => {
  const [form, setForm] = useState(initialFormState)
  const [todos, setTodos] = useState<todo[]>([])

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    const todos: any = await API.graphql(graphqlOperation(listTodos))
    setTodos(todos.data.listTodos.items)
  }

  const handleChange = (event: any) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      if (form.description && form.name) {
        const todo = {
          id: uuid(),
          name: form.name,
          description: form.description,
        }
        setForm(initialFormState)
        await API.graphql(graphqlOperation(createTodo, { input: todo }))
        fetchTodos()
      }
    } catch (err: any) {
      console.log(err)
    }
  }

  const deleteTodoByID = async (id: string) => {
    try {
      await API.graphql(graphqlOperation(deleteTodo, { input: { id } }))
      fetchTodos()
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className='main'>
      <div className='form'>
        <form onSubmit={(e) => handleSubmit(e)} className='todo-form'>
          <div className='form-group'>
            <div>
              <label htmlFor='name'>Title</label>
            </div>
            <div>
              <input
                onChange={(event) => handleChange(event)}
                value={form.name}
                name='name'
                className='form-input'
              />
            </div>
          </div>
          <div className='form-group'>
            <div>
              <label htmlFor='description'>Description</label>
            </div>
            <div>
              <input
                onChange={(event) => handleChange(event)}
                value={form.description}
                name='description'
                className='form-input'
              />
            </div>
          </div>
          <button type='submit'>SAVE</button>
        </form>
      </div>
      <div className='container'>
        <div className='todos'>
          {todos.map((item: todo, index: number) => {
            return (
              <div className='todo' key={index}>
                <button onClick={() => deleteTodoByID(item.id)}>Delete</button>
                <h4>TITLE: {item.name}</h4>
                <p>DESCRIPTION: {item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default withAuthenticator(App)
;
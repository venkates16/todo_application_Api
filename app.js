let express = require('express')
let app = express()
app.use(express.json())

let path = require('path')

let {open} = require('sqlite')
let sqlite3 = require('sqlite3')
let db_path = path.join(__dirname, 'todoApplication.db')
let database = null

let initalize_db_server = async () => {
  try {
    database = await open({
      filename: db_path,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running on Port 3000')
    })
  } catch (error) {
    console.log(error.meassage)
  }
}

initalize_db_server()

const hasPriorityAndStatusProperties = requestQuery => {
  console.log(1)
  console.log(
    requestQuery.priority !== undefined && requestQuery.status !== undefined,
  )

  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  console.log(2)
  console.log(requestQuery.priority)
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  console.log(3)
  console.log(requestQuery.status)
  return requestQuery.status !== undefined
}

app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  //console.log(request.query)
  const {search_q = '', priority, status} = request.query

  switch (true) {
    case hasPriorityAndStatusProperties(request): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`
      break
    case hasPriorityProperty(request):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`
      break
    case hasStatusProperty(request):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`
      break
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`
  }

  data = await database.all(getTodosQuery)
  response.send(data)
})

app.get('/todos/:todoId/', async (request, response) => {
  let {todoId} = request.params
  let query = `
  SELECT 
  *
  FROM
  TODO
  WHERE 
  id=${todoId}
  `
  let db_response = await database.get(query)
  response.send(db_response)
})

app.post('/todos/', async (request, response) => {
  let {id, todo, priority, status} = request.body
  let query = `
  INSERT INTO TODO (id , todo ,priority,status)
values(${id},'${todo}' ,"${priority}",'${status}')`

  let db_response = await database.run(query)
  let mn = db_response.lastId
  response.send('Todo Successfully Added')
})

let status_update = request => {
  let {status} = request.body
  console.log(status !== undefined)
  return status !== undefined
}

let priority_update = request => {
  let {priority} = request.body
  console.log(priority !== undefined)
  return priority !== undefined
}

let todo_update = request => {
  let {todo} = request.body
  console.log(todo !== undefined)
  return todo !== undefined
}

app.put('/todos/:todoId/', async (request, response) => {
  let {status = '', priority = '', todo = ''} = request.body
  let {todoId} = request.params

  let query = null

  switch (true) {
    case status_update(request):
      query = `
   UPDATE todo 
  SET 
  status ='${status}'
  WHERE 
  id=${todoId} 

  `
      break

    case priority_update(request):
      query = `
        UPDATE TODO 
        SET 
        priority ='${priority}'
        where 
        id=${todoId} ;
        
        `
      break
    case priority_update(request):
      query = `
        UPDATE TODO 
        SET 
        todo ='${todo}'
        where 
        id=${todoId} ;
        
        `
      break
  }

  if (status !== undefined) {
    await database.run(query)
    response.send('Status Updated')
  } else if (priority !== undefined) {
    await database.run(query)
    response.send('Priority Updated')
  } else {
    await database.run(query)
    response.send('Tdo Updated')
  }
})

app.delete('/todos/:todoId/', async (request, response) => {
  let {todoId} = request.params
  let query = `
  
  DELETE FROM 
  TODO 
  WHERE 
    id =${todoId} 

  `
  await database.run(query)
  response.send('Todo Deleted')
})

module.exports = app

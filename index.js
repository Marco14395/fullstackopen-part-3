require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const url = process.env.MONGODB_URI
const Person = require('./models/persons')

app.use(express.json())
mongoose.connect(url)
app.use(cors())
app.use(express.static('build'))

morgan.token('body', (req, res) => {
    const body = req.body
    return JSON.stringify(body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (request, response) => {
    response.send('<h1>My server</h1>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(guys => {
        response.json(guys)
    })
})

app.get('/info', (request, response) => {
    Person.estimatedDocumentCount().then(count => {
        response.send(`Phonebook has information of ${count} people ${new Date()}`)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(
        person => {
            if(person)
            {
                response.json(person)
            } else {
                return response.status(404).end()
            }
        }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', async(request, response, next) => {
    const body = request.body
    const person = await Person.findOne({ name: body.name })
    if(!body.name)
    {
        return response.status(400).json({ error: 'The name is missing' })
    }
    else if (!body.number)
    {
        return response.status(400).json({ error: 'The number is missing' })
    } else if (person)
    {
        return response.status(400).json({ error: 'The person is already added' })
    } else {
        const person = new Person({ name: body.name, number: body.number })
        person.save().then(savedPerson => response.json(savedPerson))
            .catch(error => next(error))
    }
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body
    Person.findByIdAndUpdate(
        request.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' }
    ).then(updatedPerson => {
        response.json(updatedPerson)
    }).catch(error => next(error))
})

const errorHandler = ( error, request, response, next) => {
    console.error(error.message)
    if(error.name === 'CastError')
    {
        return response.status(400).send({ error: 'malformatted id' })
    }else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
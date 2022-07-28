const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.static('build'));

morgan.token("body", (req, res) => {
    const body = req.body;
    return JSON.stringify(body);
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (request, response) => {
    response.send('<h1>My server</h1>')
})



let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons);
})

app.get('/info', (request, response) => {
    response.send(`Phonebook has information of ${persons.length} people
${new Date()}`);
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find(person => person.id === id); 

    if(person)
    {
        response.json(person);
    } else {
        response.status(404).end();
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter(person => person.id !== id);

    response.status(204).end()
})

const generateId = () => {
    return Math.floor(Math.random() * 10000)
}

app.post('/api/persons', (request, response) => {
    const body = request.body;
    if(!body.name)
    {
        return response.status(400).json({error: "The name is missing"});
    }
    else if (!body.number)
    {
        return response.status(400).json({error: "The number is missing"});
    }
    else if (persons.some(person => person.name === body.name)){
        return response.status(400).json({error: "The name already exists in the phonebook"})
    } 
    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }
    persons = persons.concat(person);
    response.json(person);
})

app.put('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const body = request.body;
    const number = body.number;
    const name = body.name;
    const person = persons.find(person => person.id === id);
    newPerson = {...person, number: number};
    persons = persons.map(person => person.name == name? newPerson: person)
    response.json(newPerson);
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
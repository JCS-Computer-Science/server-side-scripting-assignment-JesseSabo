const express = require("express");
const uuid = require("uuid")
const server = express();
server.use(express.json())
server.use(express.static('public'))


//All your code goes here
let activeSessions={}

server.get('/newgame', (req, res) =>{
    let newID = uuid.v4()
    let gameState = {
        wordToGuess: "apple",
        guesses: [],
        wrongLetters: [],
        closeLetters: [],
        rightLetters: [],
        remainingGuesses: 6,
        gameOver: false
    }
    if (req.query.answer) {
        gameState.wordToGuess = req.query.answer
    }
    activeSessions[newID] = gameState
    res.status(201)
    res.send({ sessionID: newID })
})


server.get('/gamestate', (req, res) => {
    let currentSession = req.query.sessionID
    let gameState = {
        guesses: activeSessions[currentSession].guesses,
        wrongLetters: activeSessions[currentSession].wrongLetters,
        closeLetters: activeSessions[currentSession].closeLetters,
        rightLetters: activeSessions[currentSession].rightLetters,
        remainingGuesses: activeSessions[currentSession].remainingGuesses

    }

    res.status(200)
    res.send({ gameState: gameState })
})

server.post('/guess', (req, res) => {
    let sessionID = req.body.sessionID
    let guess = req.body.guess
    let gameState = activeSessions[sessionID]
    let answer = gameState.wordToGuess.split()
    let letters = guess.split()
    let wrong = []
    let close = []
    let right = []

    for (let i = 0; i < letters.length; i++) {
        if (letters[0] == answer[i]) {
            right.push(letters[0])
        }
    }


    // console.log(gameState)
    res.status(201)
    res.send({ sessionID , guess: guess })
})



//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;
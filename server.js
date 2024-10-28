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
    let session = activeSessions[sessionID]
    let answer = session.wordToGuess.split('')
    let letters = guess.split('')
    console.log(guess)
    for (let i = 0; i < 5; i++) {
        let start = i
        if (letters[i] == answer[i]) {
            session.rightLetters.push(letters[i])
        } else if (letters[i] != answer[i]) {
            let isWrong = false
            for (let j = 0; j < letters.length - start; j++) {
                if (letters[start] == answer[start + j]) {
                    session.closeLetters.push(letters[start])
                    isWrong = false
                    j = letters.length - start
                } else {
                    isWrong = true
                }
            }
            if (isWrong) {
                session.wrongLetters.push(letters[start])
            }
        }
    }
    let gameState = {
        guesses: session.guesses.push(guess),
        wrongLetters: session.wrongLetters,
        closeLetters: session.closeLetters,
        rightLetters: session.rightLetters,
        remainingGuesses: session.remainingGuesses -= 1
    }
    
   
    
    
    

    console.log(gameState)
    res.status(201)
    res.send({ gameState: gameState })
})



//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;
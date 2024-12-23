const express = require("express");
const uuid = require("uuid")
const server = express();
server.use(express.json())
server.use(express.static('public'))
let api = "https://api.datamuse.com/words?sp=?????"


//All your code goes here
let activeSessions={}

server.get('/newgame', (req, res) =>{
    let possibleWords = ["apple","hello","world","balls","sport","games","clone","moose","birds","goose","geese","storm","rings","signs","state","glass","hands","right","write","wrong","close","there","their","lunch","vinyl","seven","eight","lists","debug","lines","trees","three","frogs","timer","prime","chair","wheel","steel","cards","board","sword","marks","phone","piano","press","tires","print","month","years","space","phase","angle","angel","loose","house","mouse","route","ruote","sause","power","whale","tiger","koala","snake","brown","shark","peach","berry","axles","jumps","screw","water","laser","shade","earth","smoke","thing","march","sheep","llama","melon","towel","paper","stand","plane","truck","stuck","speak","store","stare","stair","shift","enter","pause","break","stake","anvil","ankle","about","zebra","idiom","error","flash","micro","macro","dirve","might","lever","while","local","arrow","input","alarm","watch","clock","walls","spain","fruit","black","shoes","pupil","scene","index","basic","serve","using","venus","pluto","major","minor","orion","draco","latin","sufix","check","plant","brush","stick","alive","flute","bongo","pants","shirt","coats","plumb","panel","hours","money","bills","drill"]
    let newID = uuid.v4()
    let gameState = {
        wordToGuess: possibleWords[Math.floor(Math.random() * possibleWords.length)],
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
    let session = activeSessions[currentSession]
    if (session == undefined) {
        if (!currentSession) {
            let error = "no session ID"
            res.status(400)
            res.send({ error })
        } else {
            let error = "invalid session ID"
            res.status(404)
            res.send({ error })
        }
    } else {
        let gameState = {
            guesses: activeSessions[currentSession].guesses,
            wrongLetters: activeSessions[currentSession].wrongLetters,
            closeLetters: activeSessions[currentSession].closeLetters,
            rightLetters: activeSessions[currentSession].rightLetters,
            remainingGuesses: activeSessions[currentSession].remainingGuesses 
        }
        res.status(200)
        res.send({ gameState: gameState })
    }
})
server.post('/guess', (req, res) => {
    let sessionID = req.body.sessionID
    let guess = req.body.guess
    let session = activeSessions[sessionID]
    if (session == undefined) {
        if (!sessionID) {
            let error = "no session ID"
            res.status(400)
            res.send({ error })
        } else {
            let error = "invalid session ID"
            res.status(404)
            res.send({ error })
        }
    } else {
        let alphabet = "abcdefghijklmnopqrstuvwxyz".split('')
        let guessLetters = guess.split('')
        let isLetter
        for (let i = 0; i < guessLetters.length; i++) {
            let index = i
            let throughAll = false
            let isSymbol = false
            for (let j = 0; j < alphabet.length; j++) {
                if (j == alphabet.length - 1) {
                    throughAll = true
                }
                if (guessLetters[index] == alphabet[j]) {
                    isLetter = true
                    j = alphabet.length
                } else {
                    if (throughAll && !Number(guessLetters[index])) {
                        isSymbol = true
                    }
                    if (Number(guessLetters[index]) || isSymbol) {
                        isLetter = false
                        i = guessLetters.length
                        j = alphabet.length
                    }
                }
            }
        }
        if (guessLetters.length != 5 || isLetter == false) {
            let error = "invalid guess"
            res.status(400)
            res.send({ error })
        } else {
            let answer = session.wordToGuess.split('')
            let letters = guess.split('')
            let splitGuess = []
            for (let i = 0; i < 5; i++) {
                let close = session.closeLetters
                let right = session.rightLetters
                let wrong = session.wrongLetters
                let currentLetter = i
                let letter = {}
                if (letters[i] == answer[i]) {
                    session.rightLetters.push(letters[i])
                    letter.value = letters[currentLetter]
                    letter.result = "RIGHT"
                    splitGuess.push(letter)
                    for (let j = 0; j < close.length; j++) {
                        if (close[j] == letters[i]) {
                           close.splice(j, 1)
                        }
                    }
                    for (let j = 0; j < right.length - 1; j++) {
                        if (right[right.length - 1] == right[j]) {
                            right.splice(j, 1)
                        }
                    }
                } else {
                    let isWrong = false
                    for (let j = 0; j < answer.length; j++) {
                        if (letters[currentLetter] == answer[j]) {
                            close.push(letters[currentLetter])
                            letter.value = letters[currentLetter]
                            letter.result = "CLOSE"
                            splitGuess.push(letter)
                            isWrong = false
                            j = answer.length
                            for (let k = 0; k < right.length; k++) {
                                if (letters[currentLetter] == right[k]) {
                                    close.splice(close.length - 1, 1)
                                }
                            }
                            for (let k = 0; k < close.length - 1; k++) {
                                if (close[close.length - 1] == close[k]) {
                                    close.splice(k, 1)
                                }
                            }
                        } else {
                            isWrong = true
                        }
                    }
                    if (isWrong) {
                        session.wrongLetters.push(letters[currentLetter])
                        letter.value = letters[currentLetter]
                        letter.result = "WRONG"
                        splitGuess.push(letter)
                        for (let j = 0; j < wrong.length - 1; j++) {
                            if (wrong[wrong.length - 1] == wrong[j]) {
                                wrong.splice(j, 1)
                            }
                        }
                        isWrong = false
                    }
                }
            }
            session.guesses.push(splitGuess)
            let gameState = {
                guesses: session.guesses,
                wrongLetters: session.wrongLetters,
                closeLetters: session.closeLetters,
                rightLetters: session.rightLetters,
                remainingGuesses: session.remainingGuesses -= 1
            }
            let guesses = gameState.guesses
            let lastGuess = guesses[guesses.length - 1]
            for (let i = 0; i < 5; i++) {
                if (lastGuess[i].result != "RIGHT") {
                    gameState.gameOver = false
                    i = 5
                } else {
                    gameState.gameOver = true
                }
            }
            res.status(201)
            res.send({ gameState })          
        }
    }
})
server.delete('/reset', (req, res) => {
    let currentSession = req.query.sessionID
    let gameState = activeSessions[currentSession]
    if (gameState == undefined) {
        if (!currentSession) {
            let error = "no session ID"
            res.status(400)
            res.send({ error })
        } else {
            let error = "invalid session ID"
            res.status(404)
            res.send({ error })
        }
    } else {
        let noAnswer
        gameState.wordToGuess = noAnswer
        gameState.guesses = []
        gameState.wrongLetters = []
        gameState.closeLetters = []
        gameState.rightLetters = []
        gameState.remainingGuesses = 6
        gameState.gameOver = false    
        res.status(200)
        res.send({ gameState })
    }
})
server.delete('/delete', (req,res) => {
    let currentSession = req.query.sessionID
    let session = activeSessions[currentSession]
    if (session == undefined) {
        if (!currentSession) {
            let error = "no session ID"
            res.status(400)
            res.send({ error })
        } else {
            let error = "invalid session ID"
            res.status(404)
            res.send({ error })
        }
    } else {
        delete activeSessions[currentSession]
        res.status(204)
        res.send({ activeSessions })
    }
})

//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;
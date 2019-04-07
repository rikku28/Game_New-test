/*****************************************************************************************************************/
/******************************************** Script côté serveur ***********************************************/
/***************************************************************************************************************/
'use strict';

/********************** Configuration des modules "path" et "fs" (file system) de Node.JS **********************/
const path = require('path');
const fileSys = require('fs');

/********************* Configuration du module "http" avec Express JS, en plus de Node.JS *********************/
const express = require('express');
const app = express();
const httpServer = require('http').Server(app);
app.use(express.static('public'));
// app.use('/public', express.static(__dirname + '/public'));
// app.use('/assets', express.static(__dirname + '/public/assets'));

/************************** Ajout du module Node de socket.io + config du port HTTP **************************/
const socketIo = require('socket.io');
const port = 3333;

/************************************* Configuration du module MongoDB *************************************/
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const url = process.env.MONGODB_URI;
// const url = 'mongodb://localhost:27017';
const dbName = 'heroku_rm2b81xl';
// const dbName = 'jeuBackEnd';

/************* Constante de raccourci pour "console.log" + déclaration des variables globales **************/
const log = console.log;
var players = {};  // Tableau ou objet, à convertir ensuite?
var nbPlayers = 0;
var startGame = false;
var tour = 0;
var tourMax = 10;
var listeQuestions;
var attenteJoueur = true;
var finPartie = false;

/********************************** Création du serveur HTTP avec Express **********************************/
app.get('/', function(req, res){
    // log(req);
    // console.log('Dirname : ' + __dirname);
    // console.log('Filename : ' + __filename);
    // console.log(`Current directory: ${process.cwd()}`);
    // console.log('process.arg : ' + process.argv);
    let htmlFile = path.normalize(__dirname + '/public/index-projet-back.html');
    log(htmlFile);
    // Créer user en bdd ou vérifier qu'il existe en base, puis récupérer son session id
    //Doc Express pour le traitement des erreurs : https://expressjs.com/fr/guide/error-handling.html
    res.sendFile(htmlFile);
});

/**************************** On rattache le serveur HTTP à socket.io ************************************/
const io = socketIo(httpServer);
// log(io);

// Cheatsheet : 
    // io.emit => On envoie le message / les infos à tout le monde.
    // socket.emit => On envoie le message / les infos au joueur correspond.
    // socket.broadcast.emit => On envoie le message / les infos à tous les joueurs, sauf celui correspondant à la "socket".

/**************************** Récupération des questions du quiz dans la BDD ****************************/
MongoClient.connect(url,{ useNewUrlParser: true },function(error,client) {
    const db = client.db(dbName);
    const collection = db.collection('questions');
    collection.find({}).limit(15).toArray(function(error,datas) {
        client.close();
        log('Nombre de questions : ', datas.length);
        log('Il y a ' + datas.length + ' questions récupérées en BDD.');
        listeQuestions = datas;
        tourMax = datas.length;
        // log(listeQuestions);
        // Transmission des données :
        // res.render('utilisateurs', {title:'Liste des utilisateurs en base', liste: datas});
    });
});

/************************************** Création de joueurs **********************************************/
var Player = function(pseudo, urlImg, socketId){
    this.dateCrea = Date.now();
    this.pseudo = pseudo;
    this.identifiant = this.pseudo + this.dateCrea;
    this.score = 0;
    this.avatar = urlImg;
    this.socketId = socketId;
};

/*********************************** On établie la connexion socket.io *******************************************/
io.on('connection', function(socket){
    // log(socket);
    log('Coucou depuis le serveur!');
    log(`Nombre de joueurs connectés : ${nbPlayers}`);
    if(!startGame && (players.length > nbPlayers)){
        nbPlayers = players.length;
        log(nbPlayers);
        checkNbPlayers();
    }
    log(`Nombre de joueurs connectés (après nouvelle connexion): ${nbPlayers}`);


/*********************************** Vérification du nombre de joueur *******************************************/
var checkNbPlayers = function(){
    log(`Nombre de joueurs connectés (checkNbPlayers): ${nbPlayers}`);
    // log(`Joueurs connectés : ${players}`);
    log(players.length);      // => Renvoi "undefined"?
    if(nbPlayers < players.length){
        nbPlayers = players.length;
        log(`nbPlayers plus petit que players, on repasse nbPlayers à : ${nbPlayers}`);
    }

    if(nbPlayers >= 2 && tour === 0 && !startGame){
        attenteJoueur = false;
        startGame = true;
        players[socket.id].score = 0;
        log('Nb de questions : ' + listeQuestions.length);
        listeQuestions[tour].tour = tour;
        log('Question en cour : ', listeQuestions[tour]);
         io.emit('startGame', listeQuestions[tour]);
    } else{
        io.emit('attenteJoueur');
    }
};
// Connexion d'un utilisateur
    log('Un nouvel utilisateur vient de se connecter. ' + socket.id);
    log(`Le jeu est-il en cours? ${startGame}`);
    socket.on('login', function(infosUser){
        log('infosUser : ', infosUser);

        // if(){

        // } else{
            socket.pseudo = infosUser.pseudo;
            let newPlayer = new Player(infosUser.pseudo, infosUser.img, socket.id);
            log('Nouveau joueur : ', newPlayer);
            let pseudo = infosUser.pseudo;
            // players[infosUser.pseudo] = newPlayer;
            players[socket.id] = newPlayer;
            socket.playerId = players[socket.id].identifiant;
            // players.push(newPlayer);
            // players(newPlayer.pseudo) = newPlayer;
            nbPlayers++;
            log(`Nb joueurs : ${nbPlayers}`);
            socket.emit('loginOK', newPlayer);
            socket.broadcast.emit('newPlayer', newPlayer);
            log(players);
            io.emit('onlinePlayers', players);

            checkNbPlayers();
            // io.emit('onlinePlayers', newPlayer);

        // }
        
    });

// Echange de messages entre joueurs
    socket.on('chatMsg', function (message){
        log(message);
        message = message;
        // let socketId = socket.id;
        // log(socketId);
        // io.emit('afficheChatMsg', {pseudo: socket.pseudo, img: players[Player.socketId].avatar, msg: message});
        // io.emit('afficheChatMsg', {pseudo: socket.pseudo, msg: message});
        log(players);
        // log('Pseudo : ', players[socket.id].pseudo);
        io.emit('afficheChatMsg',  {pseudo: players[socket.id].pseudo, msg: message});
    });


/*********************************** Vérification de la réponse sélectionnée *******************************************/
    var checkAnswer = function(answer){
        // let rep = answer.toLowerCase();
        let repOK = listeQuestions[tour].bonneRep;
        let repOk2 = listeQuestions[tour].reponses[repOK];
        log('Réponse BDD : ' + repOk2 + ' ' + typeof repOK2);
        let repString = (repOk2).toString();
        log('Réponse BDD - convertie en chaîne de caractère? : ' + repString + ' ' + typeof repString);
        log('Réponse reçue ', answer, typeof answer);
        // log(socket);
        if(answer == repString){
        // if(answer == repOk2){
            log('Bonne réponse!');
            // let scorePlayer = players[socket.id].score;
            // scorePlayer++;
            players[socket.id].score++;
            // log(`Score du joueur : ${players[socket.id]}`);
            log(players[socket.id]);
            io.emit('bravo', {
                id: socket.playerId,
                pseudo: socket.pseudo,
                score: players[socket.id].score,
                img : players[socket.id].avatar,
                msg: 'Bonne réponse!'
            });
            return true;
        } else{
            log('Mauvaise réponse!');
            let indice = listeQuestions[tour].indiceTxt;
            socket.emit('dommage', {
                id: socket.playerId,
                pseudo: socket.pseudo,
                indiceTxt : indice,
                msg: 'Mauvaise réponse! :( Veuillez sélectionner une autre réponse.'
            });
            return false;
        }
    };

socket.on('answer', function(reponse){

    if(checkAnswer(reponse)){
        nextQuestion();
    }

});

// Logs serveur :
    // Réponse BDD : 151 undefined
    // Réponse reçue  null object
    // Mauvaise réponse!
    // Réponse BDD : 151 undefined
    // Réponse reçue  151 string
    // Bonne réponse!

/*********************************** Question suivante *******************************************/
    var nextQuestion = function(){
        tour++;
        log(`Tour n° ${tour} vs ${tourMax} questions MAX!`);
        // if(tour > listeQuestions.length){
        if(tour === tourMax){
            let msgEndGame = 'Fin de partie!';
            startGame = false;
            tour = 0;
            io.emit('endGame', {
                players : players,
                msg : msgEndGame});
        } else{
            log(`Tour n° ${tour}`);
            listeQuestions[tour].tour = tour;
            log('Question en cour : ', listeQuestions[tour]);

            io.emit('nextQuestion', listeQuestions[tour]);
        }

    };

/*********************************** Fin de partie *******************************************/
    // var theWinnerIs = function(){
    //     let scores = [];
    //     let winner;

// checkScores
    //     for (var p in players){
            
    //     }
    //     log(scores);

    //     socket.emit('gg', {
    //         id: socket.playerId,
    //         pseudo: socket.pseudo}
    //     );
    // }


/*********************************** Déconnexion d'un utilisateur *******************************************/
// Déconnexion d'un utilisateur
    socket.on('disconnect', function(reason){
        log('Déconnexion : ', socket.id, reason);
        log('Joueur qui vient de se déconnecter : ', players[socket.id]);

        // socket.broadcast.emit('decoPlayer', {pseudo: socket.pseudo, id: players[socket.id].identifiant});
        socket.broadcast.emit('decoPlayer', {pseudo: socket.pseudo, id: socket.playerId});
        nbPlayers--;
        log(`Nombre de joueurs connectés (après une déconnexion) : ${nbPlayers}`);
        delete players[socket.id];
        if(nbPlayers == undefined || nbPlayers < 0){
            nbPlayers = 0;
            startGame = false;
            attenteJoueur = true;
            tour = 0;
            log(`En cas de -1 ou undefined, nbPlayers passe à 0 : ${nbPlayers}`);
        }
    });

});

/************************************** Démarrage du serveur HTTP **************************************/
httpServer.listen(process.env.PORT || port, function(error){
// httpServer.listen(port, function(error){
    if(error){
        console.log(`Impossible d'associer le serveur HTTP au port ${port}.`);
    } else{
        console.log(`Serveur démarré et à l'écoute sur le port ${port}.`);
    }
});
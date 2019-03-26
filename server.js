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
app.use('/public', express.static(__dirname + '/public'));

/************************** Ajout du module Node de socket.io + config du port HTTP **************************/
const socketIo = require('socket.io');
const port = 3333;

/************************************* Configuration du module MongoDB *************************************/
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const url = 'mongodb://localhost:27017';
const dbName = 'jeuBackEnd';

/************* Constante de raccourci pour "console.log" + déclaration des variables globales **************/
const log = console.log;
var players = {};  // Tableau ou objet, à convertir ensuite?
var tour = 0;
var listeQuestions;
var attenteJoueur;

/********************************** Création du serveur HTTP avec Express **********************************/
app.get('/', function(req, res){
    // log(req);
    let htmlFile = path.normalize(__dirname + '/public/index-projet-back.html');
    log(htmlFile);
    // Créer user en bdd ou vérifier qu'il existe en base, puis récupérer son session id
    //Doc Express pour le traitement des erreurs : https://expressjs.com/fr/guide/error-handling.html
    res.sendFile(htmlFile);
    // log(path.dirname);
});

/**************************** On rattache le serveur HTTP à socket.io ************************************/
const io = socketIo(httpServer);

// Cheatsheet : 
    // io.emit => On envoie le message / les infos à tout le monde
    // socket.emit => On envoie le message / les infos au joueur correspond

/**************************** Récupération des questions du quiz dans la BDD ****************************/
MongoClient.connect(url,{ useNewUrlParser: true },function(error,client) {
    const db = client.db(dbName);
    const collection = db.collection('questions');
    collection.find({}).toArray(function(error,datas) {
        client.close();
        log('Nombre de questions : ', datas.length);
        listeQuestions = datas;
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
}

/*********************************** On établie la connexion *******************************************/
io.on('connection', function(socket){
    log('Coucou depuis le serveur!');

    // Connexion d'un utilisateur
    log('Un nouvel utilisateur vient de se connecter. ' + socket.id);
    
    socket.on('login', function(infosUser){
        log('infosUser : ', infosUser);
        socket.pseudo = infosUser.pseudo;
        let newPlayer = new Player(infosUser.pseudo, infosUser.img, socket.id);
        log('Nouveau joueur : ', newPlayer);
        let pseudo = infosUser.pseudo;
        // players[infosUser.pseudo] = newPlayer;
        players[socket.id] = newPlayer;
        // players.push(newPlayer);
        // players(newPlayer.pseudo) = newPlayer;
        socket.emit('loginOK', newPlayer);
        socket.broadcast.emit('newPlayer', newPlayer);
        log(players);
        // io.emit('onlinePlayers', newPlayer);
        io.emit('onlinePlayers', players);
    });

    // Echange de messages entre joueurs

    socket.on('chatMsg', function (message){
        log(message);
        message = message;
        // let socketId = socket.id;
        // log(socketId);
        // io.emit('afficheChatMsg', {pseudo: socket.pseudo, img: players[Player.socketId].avatar, msg: message});
        io.emit('afficheChatMsg', {pseudo: socket.pseudo, msg: message});
    });

    //Faire une fonction "newQuestion"

    // Faire une fonction "nextQuestion"

    // Faire une fonction "checkScore"


// Déconnexion d'un utilisateur
    socket.on('disconnect', function(reason){
        log('[disconnect]', socket.id, reason);
        // let playerDis = players[newPlayer.socketId];
        delete players[socket.id];
        socket.broadcast.emit('decoPlayer', players[socket.id]);   // Envoyé à tlm
    });



});

/************************************** Démarrage du serveur HTTP **************************************/
httpServer.listen(port, function(error){
    if(error){
        console.log(`Impossible d'associer le serveur HTTP au port ${port}.`);
    } else{
        console.log(`Serveur démarré et à l'écoute sur le port ${port}.`);
    }
});
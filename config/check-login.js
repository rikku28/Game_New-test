// const log = console.log();
log(`Bienvenue dans le module check-login.js!`);

// Expression régulière pour vérifier l'url de l'avatar
const urlRegex = new RegExp('^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$', ig);

// Fonction pour vérifier que le pseudo n'est pas vide
let verifPseudo = function(pseudo){
    if(pseudo === ("" || null || undefined || Infinity)){
        socket.emit('badPseudo', {msg: 'Votre pseudonyme est vide ou équivalent à une valeur non autorisée (null, undefined et Infinity).'});
        log(`Pseudo non valide!`);
        return false;
    } else{
        log(`Pseudo valide! -> A chercher en BDD!`);
        return true;
    }
};

// Fonction pour vérifier que le mot de passe n'est pas vide
let verifPwd  = function(pwd){
    if(pwd === ("" || null || undefined || Infinity)){
        socket.emit('badPwd', {msg: 'Votre mot de passe est vide ou équivalent à une valeur non autorisée (null, undefined et Infinity).'})
        return false;
    } else{
        log(`Mot de passe valide! -> A chercher en BDD!`);
        return true;
    }
};

// Fonction pour vérifier que l'url de l'avatar est correcte
let verifUrl = function(url){
    if(url.match(urlRegex)){
        log(`Url OK!!!`);
        return true;
    } else{
        socket.emit('badAvatar', {msg: 'L\'url du lien vers votre avatar est vide ou non valide. Cela doit commencer par \'http://\' ou \'https://\''});
        log(`Url non valide!`);
        return false;
    }
};

let findUserInDB = function(aPseudo, bPwd){
    log(`On est dans la fonction "findUserInDB".`);
    MongoClient.connect(url,{ useNewUrlParser: true },function(error,client){
        if(error){
            log(`Connexion à Mongo impossible!`);
        } else{
            const db = client.db(dbName);
            const collection = db.collection('users');
            collection.findOne({pseudo: aPseudo, mdp: bPwd}).toArray(function(error,datas){
                client.close();
                log('Pseudo trouvé ' + aPseudo + ' ? : ', datas.length);
                // let longueur = datas.length;
                // return longueur;
                return datas;
            });
        }
    });
};

let checkVerifs = function(aPseudo, bPwd, cAvatar, firstLogin){
    log(`On est dans la fonction "checkVerifs".`);
    if(aPseudo && bPwd && cAvatar && firstLogin){
        log(`Pseudo reçu : ${infosUser.pseudo}`);
        findUserInDB(infosUser.pseudo, infosUser.mdp);

        if(findUserInDB.length === (0 || null || undefined)){
            log(`Le pseudonyme n'existe pas en base. On enregistre les infos`);
            MongoClient.connect(url, { useNewUrlParser: true }, function(error,client){
                if(error){
                    log(`Connexion à Mongo impossible!`);
                } else{
                    const db = client.db(dbName);
                    const collection = db.collection('users');
                    collection.insertOne({pseudo: infosUser.pseudo, pwd: infosUser.mdp, avatar: infosUser.img}).toArray(function(error,datas){
                        client.close();
                        log('Nombre de questions : ', datas.length);
                    });
                }
            });

            socket.pseudo = infosUser.pseudo;
            let newPlayer = new Player(infosUser.pseudo, infosUser.mdp, infosUser.img, socket.id);
            log('Nouveau joueur : ', newPlayer);
            let pseudo = infosUser.pseudo;
            players[socket.id] = newPlayer;
            socket.playerId = players[socket.id].identifiant;
            nbPlayers++;

            log(`Nb joueurs : ${nbPlayers}`);
            socket.emit('loginOK', newPlayer);
            socket.broadcast.emit('newPlayer', newPlayer);
            log(players);
            io.emit('onlinePlayers', players);

            // checkNbPlayers();

        } else{
            let message = `Le pseudo ${infosUser.pseudo} est déjà pris!`;
            socket.emit('alreadyUsedPseudo', {msg: message});
            log(`Pseudo déjà utilisé!`);
        }
    } else{
        if ((aPseudo && bPwd) && (!cAvatar && !firstLogin)){
// On récupère les infos en base.
            findUserInDB(aPseudo);
            
            if(findUserInDB.pseudo === infosUser.pseudo && findUserInDB.pwd === infosUser.mdp){
                socket.pseudo = infosUser.pseudo;
                let newPlayer = new Player(infosUser.pseudo, infosUser.mdp, infosUser.img, socket.id);
                log('Nouveau joueur : ', newPlayer);
                let pseudo = infosUser.pseudo;
                players[socket.id] = newPlayer;
                socket.playerId = players[socket.id].identifiant;
                nbPlayers++;
    
                log(`Nb joueurs : ${nbPlayers}`);
                socket.emit('loginOK', newPlayer);
                socket.broadcast.emit('newPlayer', newPlayer);
                log(players);
                io.emit('onlinePlayers', players);
    
                // checkNbPlayers();
            }
        } else{
            socket.emit('userUnknown');
        }
    }
};

// Connexion d'un utilisateur
    log('Un nouvel utilisateur vient de se connecter. ' + socket.id);
    log(`Le jeu est-il en cours? ${startGame}`);

    socket.on('login', function(infosUser){
        log('infosUser : ', infosUser);

        verifPseudo(infosUser.pseudo);
        log(verifPseudo(infosUser.pseudo));

        verifPwd(infosUser.mdp);
        log(verifPwd(infosUser.mdp));

        verifUrl(infosUser.img);
        log(verifUrl(infosUser.img));

        log(infosUser.firstLogin);

        checkVerifs(verifPseudo, verifPwd, verifUrl);

        checkNbPlayers();

        // if(() === false){
            
        // } else{
            // socket.pseudo = infosUser.pseudo;
            // let newPlayer = new Player(infosUser.pseudo, infosUser.mdp, infosUser.img, socket.id);
            // log('Nouveau joueur : ', newPlayer);
            // let pseudo = infosUser.pseudo;
            // // players[infosUser.pseudo] = newPlayer;
            // players[socket.id] = newPlayer;
            // socket.playerId = players[socket.id].identifiant;
            // // players.push(newPlayer);
            // // players(newPlayer.pseudo) = newPlayer;
            // nbPlayers++;
            // log(`Nb joueurs : ${nbPlayers}`);
            // socket.emit('loginOK', newPlayer);
            // socket.broadcast.emit('newPlayer', newPlayer);
            // log(players);
            // io.emit('onlinePlayers', players);

            // checkNbPlayers();
            // io.emit('onlinePlayers', newPlayer);

        // }
        
    });

// let module.exports = 
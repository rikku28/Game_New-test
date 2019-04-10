console.log(`Bienvenue dans le module check-login.js!`);
var exports = module.exports = {};

// exports.log = console.log();

// Fonction pour vérifier que le pseudo n'est pas vide
// let verifPseudo = function(pseudo){
exports.verifPseudo = function(pseudo){
    if(pseudo === ("" || null || undefined || Infinity)){
        socket.emit('badPseudo', {msg: 'Votre pseudonyme est vide ou équivalent à une valeur non autorisée (null, undefined et Infinity).'});
        console.log(`Pseudo non valide!`);
        return false;
    } else{
        console.log(`Pseudo valide! -> A chercher en BDD!`);
        return true;
    }
};

// Fonction pour vérifier que le mot de passe n'est pas vide
// let verifPwd  = function(pwd){
exports.verifPwd  = function(pwd){
    if(pwd === ("" || null || undefined || Infinity)){
        socket.emit('badPwd', {msg: 'Votre mot de passe est vide ou équivalent à une valeur non autorisée (null, undefined et Infinity).'})
        return false;
    } else{
        console.log(`Mot de passe valide! -> A chercher en BDD!`);
        return true;
    }
};

// Fonction pour vérifier que l'url de l'avatar est correcte
// let verifUrl = function(url){
exports.verifUrl = function(url){
    
// Expression régulière pour vérifier l'url de l'avatar
// const urlRegex = new RegExp('^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$', ig);

    const urlRegex = new RegExp('^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$', 'ig');

    if(url.match(urlRegex)){
        console.log(`Url OK!!!`);
        return true;
    } else{
        socket.emit('badAvatar', {msg: 'L\'url du lien vers votre avatar est vide ou non valide. Cela doit commencer par \'http://\' ou \'https://\''});
        console.log(`Url non valide!`);
        return false;
    }
};

// Fonction pour récupérer les infos de l'utilisateur en base
// let findUserInDB = function(aPseudo, bPwd){
exports.findUserInDB = function(aPseudo, bPwd){
    console.log(`On est dans la fonction "findUserInDB".`);
    MongoClient.connect(url,{ useNewUrlParser: true },function(error,client){
        if(error){
            console.log(`Connexion à Mongo impossible!`);
        } else{
            const db = client.db(dbName);
            const collection = db.collection('users');
            collection.findOne({pseudo: aPseudo, mdp: bPwd}).toArray(function(error,datas){
                client.close();
                console.log('Pseudo trouvé ' + aPseudo + ' ? : ', datas.length);
                // let longueur = datas.length;
                // return longueur;
                return datas;
            });
        }
    });
};

// Fonction globale de vérification, 
// let checkVerifs = function(aPseudo, bPwd, cAvatar, firstLogin){
exports.checkVerifs = function(aPseudo, bPwd, cAvatar, firstLogin){
    console.log(`On est dans la fonction "checkVerifs".`);

    if(aPseudo && bPwd && cAvatar && firstLogin){
        console.log(1);
        console.log(`Pseudo reçu : ${infosUser.pseudo}`);
        findUserInDB(infosUser.pseudo, infosUser.mdp);

        if(findUserInDB.length === (0 || null || undefined)){
            console.log(`Le pseudonyme n'existe pas en base. On enregistre les infos`);
            console.log(2);
            MongoClient.connect(url, { useNewUrlParser: true }, function(error,client){
                if(error){
                    console.log(`Connexion à Mongo impossible!`);
                } else{
                    const db = client.db(dbName);
                    const collection = db.collection('users');
                    collection.insertOne({pseudo: infosUser.pseudo, pwd: infosUser.mdp, avatar: infosUser.img}).toArray(function(error,datas){
                        client.close();
                        console.log('Nombre de questions : ', datas.length);
                    });
                }
            });

            console.log(3);
            socket.pseudo = infosUser.pseudo;
            let newPlayer = new Player(infosUser.pseudo, infosUser.mdp, infosUser.img, socket.id);
            console.log('Nouveau joueur : ', newPlayer);
            let pseudo = infosUser.pseudo;
            players[socket.id] = newPlayer;
            socket.playerId = players[socket.id].identifiant;
            nbPlayers++;

            console.log(`Nb joueurs : ${nbPlayers}`);
            socket.emit('loginOK', newPlayer);
            socket.broadcast.emit('newPlayer', newPlayer);
            console.log(players);
            io.emit('onlinePlayers', players);

            // checkNbPlayers();

        } else{
            console.log(4);
            let message = `Le pseudo ${infosUser.pseudo} est déjà pris!`;
            socket.emit('alreadyUsedPseudo', {msg: message});
            console.log(`Pseudo déjà utilisé!`);
        }

    } else{
        if ((aPseudo && bPwd) && (!cAvatar && !firstLogin)){
            console.log(5);
            findUserInDB(aPseudo);
            
            if(findUserInDB.pseudo === infosUser.pseudo && findUserInDB.pwd === infosUser.mdp){
                console.log(6);
                
                socket.pseudo = infosUser.pseudo;
                let newPlayer = new Player(infosUser.pseudo, infosUser.mdp, infosUser.img, socket.id);
                console.log('Nouveau joueur : ', newPlayer);
                let pseudo = infosUser.pseudo;
                players[socket.id] = newPlayer;
                socket.playerId = players[socket.id].identifiant;
                nbPlayers++;
    
                console.log(`Nb joueurs : ${nbPlayers}`);
                socket.emit('loginOK', newPlayer);
                socket.broadcast.emit('newPlayer', newPlayer);
                console.log(players);
                io.emit('onlinePlayers', players);
    
                // checkNbPlayers();
            }
        } else{
            console.log(7);
            socket.emit('userUnknown');
        }
    }
};

// Connexion d'un utilisateur
    // console.log('Un nouvel utilisateur vient de se connecter. ' + socket.id);
    // console.log(`Le jeu est-il en cours? ${startGame}`);

    // socket.on('login', function(infosUser){
    //     console.log('infosUser : ', infosUser);

    //     verifPseudo(infosUser.pseudo);
    //     console.log(verifPseudo(infosUser.pseudo));

    //     verifPwd(infosUser.mdp);
    //     console.log(verifPwd(infosUser.mdp));

    //     verifUrl(infosUser.img);
    //     console.log(verifUrl(infosUser.img));

    //     console.log(infosUser.firstLogin);

    //     checkVerifs(verifPseudo, verifPwd, verifUrl);

    //     checkNbPlayers();
        
    // });
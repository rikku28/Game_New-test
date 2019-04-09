// const urlRegex = ;
const urlRegex = new RegExp('^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$', ig);

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

let verifPwd  = function(pwd){
    if(pwd === ("" || null || undefined || Infinity)){
        socket.emit('badMdp', {msg: 'Votre mot de passe est vide ou équivalent à une valeur non autorisée (null, undefined et Infinity).'})
        return false;
    } else{
        log(`Mot de passe valide! -> A chercher en BDD!`);
        return true;
    }
};

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

let findPseudoBDD = function(aPseudo){
    // Si ça ne fonctionne pas comme ça, passer le pseudo en "toLowerCase", puis retirer les //i autour de la variable du pseudo modifiée dans la recherche ci-dessous. Ca nécessitera d'enregistrer tous les pseudos de la même manière, donc idéalement en miniscules.

    MongoClient.connect(url,{ useNewUrlParser: true },function(error,client){
        const db = client.db(dbName);
        const collection = db.collection('users');
        collection.find({pseudo: /aPseudo/i}).toArray(function(error,datas){
            client.close();
            log('Pseudo trouvé? : ', datas.length);
            // let longueur = datas.length;
            // return longueur;
            return datas;
        });
    });
};

let checkVerifs = function(aPseudo, bPwd, cAvatar, firstLogin){
    if(aPseudo && bPwd && cAvatar && firstLogin){
        findPseudoBDD(aPseudo);
        if(findPseudoBDD.length === (0 || null || undefined)){
            log(`Le pseudonyme n'existe pas en base.`);
            MongoClient.connect(url, { useNewUrlParser: true }, function(error,client){
                const db = client.db(dbName);
                const collection = db.collection('users');
                collection.insertOne({pseudo: aPseudo, pwd: bPwd, avatar: cAvatar}).toArray(function(error,datas){
                    client.close();
                    log('Nombre de questions : ', datas.length);
                });
            });
        } else{
            if ((a && b) && (!c && !firstLogin)){
                findPseudoBDD(aPseudo);
            }
        }
    }
};

// Connexion d'un utilisateur
    log('Un nouvel utilisateur vient de se connecter. ' + socket.id);
    log(`Le jeu est-il en cours? ${startGame}`);

    socket.on('login', function(infosUser){
        log('infosUser : ', infosUser);

        verifPseudo(infosUser.pseudo);
        verifPwd(infosUser.mdp);
        verifUrl(infosUser.img);

        if(() === false){
            

        } else{
            socket.pseudo = infosUser.pseudo;
            let newPlayer = new Player(infosUser.pseudo, infosUser.mdp, infosUser.img, socket.id);
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

        }
        
    });
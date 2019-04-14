/************************************* A mettre dans "server.js" : Modularisation de la vérification des identifants du joueur qui se connecte *************************************/
// console.log('Dirname : ' + __dirname);
// const checkLogin = require('./config/check-login.js');

/************************************* Données pour le module "check-login.js" : Modularisation de la vérification des identifants du joueur qui se connecte : Trop galère, il faudrait exporter toutes les sockets pour que le module puisse émettre*************************************/

console.log(`Bienvenue dans le module check-login.js!`);
var exports = module.exports = {};

// Fonction pour vérifier que le pseudo n'est pas vide
exports.verifPseudo = function(pseudo){
    if(pseudo === '' || pseudo.length === 0 || pseudo === 'null' || pseudo === 'undefined' || pseudo === 'Infinity'){
        // socket.emit('badPseudo', {msg: 'Votre pseudonyme est vide ou équivalent à une valeur non autorisée (null, undefined et Infinity).'});
        console.log(`Dans le module : Pseudo non valide!`);
        return false;
    } else{
        console.log(`Pseudo valide! -> A chercher en BDD!`);
        return true;
    }
};

// Fonction pour vérifier que le mot de passe n'est pas vide
exports.verifPwd  = function(pwd){
    if(pwd === '' || pwd === null || pwd.length === 0 || pwd === undefined || pwd === Infinity){
        // socket.emit('badPwd', {msg: 'Votre mot de passe est vide ou équivalent à une valeur non autorisée (null, undefined et Infinity).'});
        console.log(`Dans le module : Mot de passe non valide!`);
        return false;
    } else{
        console.log(`Mot de passe valide! -> A chercher en BDD!`);
        return true;
    }
};

// Fonction pour vérifier que l'url de l'avatar est correcte
// let verifUrl = function(url){
exports.verifUrl = function(url, premiereConnexion){
// Expression régulière pour vérifier l'url de l'avatar
// const urlRegex = new RegExp('^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$', ig);

    const urlRegex = new RegExp('^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$', 'igm');

    // if(url.match(urlRegex) && premiereConnexion){
    if(url.match(urlRegex)){
        console.log(`Url OK!!!`);
        return true;
    } else{
        // socket.emit('badAvatar', {msg: 'L\'url du lien vers votre avatar est vide ou non valide. Cela doit commencer par \'http://\' ou \'https://\''});
        console.log(`Dans le module : Url non valide!`);
        return false;
    }
};

// Fonction pour récupérer les infos de l'utilisateur en base
// let findUserInDB = function(aPseudo, bPwd){
// exports.findUserInDB = function(aPseudo, bPwd){
//     const MongoClient = require('mongodb').MongoClient;
//     const url = process.env.MONGODB_URI;
//     const dbName = 'heroku_rm2b81xl';
    
//     console.log(`On est dans la fonction "findUserInDB".`);
//     MongoClient.connect(url,{ useNewUrlParser: true },function(error,client){
        // log(`On rentre dans la fonction de callback.`);
//         if(error){
//             console.log(`Connexion à Mongo impossible!`);
//         } else{
//             console.log(`On est dans le "else" de la fonction "findUserInDB".`);
//             const db = client.db(dbName);
//             const collection = db.collection('users');
//             // collection.findOne({pseudo: aPseudo, mdp: bPwd}).toArray(function(error,datas){
//                 var test = collection.findOne();
//                 console.log(toJSON(test));
//             //     .toArray(function(error,datas){
//             //     console.log(datas);
//             //     // console.log('Pseudo trouvé ' + aPseudo + ' ? : ', datas.length);
//             //     client.close();
//             //     // let longueur = datas.length;
//             //     // return longueur;
//             //     return datas;
//             // });
//         }
//     });
// };
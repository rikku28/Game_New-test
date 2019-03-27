/******************************************************************************************************************/
/********************************************* Script côté client ************************************************/
/****************************************************************************************************************/
'use strict';

// IIFE
(function(window, io){
/***************************************** Event de chargement du DOM ******************************************/
    window.addEventListener('DOMContentLoaded', function(){

/************** Constante de raccourci pour "console.log" + déclaration des variables globales ***************/
        const log = console.log;
// On déclare l'ip et le port auxquels le socket sera relié.
        // var socket = io('http://192.168.0.122:3333');
        var socket = io('http://10.53.43.142:3333');

// Date et timestamp de la date du jour
        var dateJour = new Date();
        var timestamp=dateJour.getTime(dateJour);
        var players = [];

/******************************************* Actions côté client ********************************************/
        log('Coucou côté client');
// On masque toutes les balises sauf celles du formulaire de connexion
        $('.masquee').hide(); // à la place de .fadeOut()

// Formulaire de connnexion : Récupération, puis envoi des infos de connexion au serveur
    let loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', function(event){
        event.preventDefault();

        socket.emit('login', {
            pseudo : $('#login-form-pseudo').val(),
            // mail: $('#"login-form-email').val(),
            mdp: $('#login-form-mdp').val(),
            img: $('#login-form-avatar').val()
        });
    });

// Nouveau joueur connecté
    socket.on('loginOK', function(infos){
        log(`Pseudo transmis au joueur connecté : ${infos}`);
        $('#login-form').remove();
        $('.masquee').show(); // ou .fadeIn()?
        $('#welcome').html('<h1 style="font-size: 3em">Bienvenue ' + infos.pseudo + ' <img src="' + infos.avatar + '" width="75px"/></h1>');
    });

    socket.on('newPlayer', function(infos){
        log('Pseudo transmis aux autres joueurs', infos);
        $('#zone-infos').prepend('<p><em> ' + infos.pseudo + ' a rejoint la partie !</em></p>');
        // $('#online-players').append('<p><img src="' + infos.avatar + '" width="50px"/> ' + infos.pseudo + ' - Score : ' + infos.score + '</p>');
        // players
    });

    socket.on('onlinePlayers', function(infos){
        $('#online-players').empty();
        log('Joueurs en ligne', infos);
        for (var player in infos){
            $('#online-players').append('<p class="infos-joueurs" id="' + infos[player].identifiant + '"><img src="' + infos[player].avatar + '" width="50px"/> ' + infos[player].pseudo + ' - Score : <span class="score">' + infos[player].score + '</span></p>');
        }
    });
    
// Déconnexion d'un joueur
    socket.on('decoPlayer', function(pseudo){
        log('Joueur déconnecté : ', pseudo);
        // $('#' + player.id).remove();
        $('#zone-infos').prepend('<p><em>' + pseudo + ' s\'est déconnecté !</em></p>');
    });

// Echange de messages
    $('#chat-form').submit(function(e){
        e.preventDefault();
        var message = $('#chat-message').val();
        socket.emit('chatMsg', message); // Transmet le message au serveur
        $('#chat-message').val('').focus(); // Vide la zone de Chat et remet le focus dessus
    });

    socket.on('afficheChatMsg', function(msg){
        // $('#zone-infos').append('<p><img src="' + msg.img + '"/>"</p><p><strong>' + msg.pseudo + '</strong> : ' + msg.msg + '</p>');
        $('#zone-infos').prepend('<p><strong>' + msg.pseudo + '</strong> : ' + msg.msg + '</p>');
    });

    // var i = 0;
    // var questionEnCours = i;
    // var tabQuestions = [];
    // socket.on('newQuestion', function(mongoDatas){
    //     log(mongoDatas);
    // });


/***********************************************************************/
/******************** Affichage de la date du jour ********************/
/*********************************************************************/
    (function today(){
    // IIFE qui affiche la date dans le footer, pour le fun. Création de tableaux pour récupérer les mois et jours sous forme textuels. Vu que ces données ne changement pas, je les ai déclaré en constantes.
            let todayP = document.getElementById('date-jour');
            let numeroJour = dateJour.getDate(); 
            let indexJour = dateJour.getDay();   // getDay() va de 0 à  6, 0 correspondant à  Dimanche et 6 à  samedi. 
            const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'jendredi', 'samedi']; 
            let indexMois = dateJour.getMonth();   // getMonth() va de 0 à  11, 0 correspondant au mois de Janvier et 11 au mois de Décembre. 
            const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    // let jour = jours[indexJour] + ' ' + numeroJour + ' ' + mois[indexMois] + ' ' + annee; 
            // console.log(jour); 
            let txtDate = document.createTextNode('Aujourd\'hui, nous sommes le ' + jours[indexJour] + ' ' + numeroJour + ' ' + mois[indexMois] + ' ' + dateJour.getFullYear());
            todayP.appendChild(txtDate);
        })();
    });
})(window, io);
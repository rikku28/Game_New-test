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
        // var socket = io('http://10.53.43.142:3333');
        var socket = io('http://10.53.42.8:3333');

// Date et timestamp de la date du jour
        var dateJour = new Date();
        var timestamp=dateJour.getTime(dateJour);
        var players = [];

/******************************************* Actions côté client ********************************************/
        log('Coucou côté client');
// On masque toutes les balises sauf celles du formulaire de connexion
        $('.cache-quizz').hide();
        $('.cache-infos-joueurs').hide(); // à la place de .fadeOut()

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
        $('.cache-infos-joueurs').show(); // ou .fadeIn()?
        $('#welcome').html('<h1 style="font-size: 3em">Bienvenue ' + infos.pseudo + ' <img src="' + infos.avatar + '" width="75px"/></h1>');
        players.push(infos.pseudo);
        log(players);
    });

    socket.on('newPlayer', function(infos){
        log('Pseudo transmis aux autres joueurs', infos);
        $('#zone-infos').prepend('<p><em> ' + infos.pseudo + ' a rejoint la partie !</em></p>');
        // $('#online-players').append('<p><img src="' + infos.avatar + '" width="50px"/> ' + infos.pseudo + ' - Score : ' + infos.score + '</p>');
        // players
    });

// Affichage des joueurs en ligne
    socket.on('onlinePlayers', function(infos){
        $('#online-scores').empty();
        // $('#online-players').append('<h2>Question du quiz</h2>');
        log('Joueurs en ligne', infos);
        for (var player in infos){
            $('#online-scores').append('<p class="infos-joueurs" id="' + infos[player].identifiant + '"><img src="' + infos[player].avatar + '" width="50px"/> ' + infos[player].pseudo + ' - Score : <span class="score">' + infos[player].score + '</span></p>');
            // A voir pour utiliser infos[player].identifiant à la place.
        }
    });
    
// Déconnexion d'un joueur
    socket.on('decoPlayer', function(infos){
        log('Joueur déconnecté : ', infos);
        // $('#zone-infos').prepend('<p><em>' + infos.pseudo + ' - ' + infos.id + ' s\'est déconnecté !</em></p>');
        $('#zone-infos').prepend('<p><em>' + infos.pseudo + ' s\'est déconnecté !</em></p>');
        let balPlayerDis = document.getElementById(infos.id);
        $(balPlayerDis).remove();
        // A faire : Suppression de la balise dont l'id correspond au pseudo
        // $('#'pseudo).remove();
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


    socket.on('attenteJoueur', function(){
        $('#zone-infos').prepend('<p><em>Attente d\'un autre joueur.</em></p>');
    });

    socket.on('startGame', function(q0){
        log(q0);
        $('#zone-infos').prepend('<p><em>La partie commence! ^__^ </em></p>');
        $('.cache-quizz').show();
        currentQuestion(q0);
        // showQuestion(q0);    // setTimeout qui se déclenche avant "l'écoute" de "startGame".
    });

    $('#question-form').click(function(e){
        // clearTimeout(premQuestion);
        e.preventDefault();
        // var reponseSelectionnee = $('input[name=q1]:checked').val();
        var reponseSelectionnee = $('input[name=q1]:checked').val();
        log(reponseSelectionnee);
        socket.emit('answer', reponseSelectionnee);
        // if($('input[name=q1]:checked').val())
    });
    
    socket.on('gg', function(infos){
        log(infos);
        $('#zone-infos').prepend('<p><em> Bravo ' + infos.pseudo + '! Vous avez ' + infos.score + ' points. </em></p>');
    });

    socket.on('bravo', function(infos){
        log(infos);
        $('#zone-infos').prepend('<p><em>' + infos.pseudo + ' remporte le point. </em></p>');
        // showQuestion(q0);
    });

    socket.on('dommage', function(infos){
        log(infos);
        $('#zone-infos').prepend('<p><em> Ce n\'est pas la bonne réponse ' + infos.pseudo + '. Réessayez.</em></p>');
        // showQuestion(q0);
    });

/*********************************** Affichage de la question en cours *******************************************/
    // var showQuestion = setTimeout(function(question){
    //     $('.cache-quizz').show();
    //     currentQuestion(question);
    // }, 5000);

    var currentQuestion = function(questionEnCours){
// Affichage de la question et ses indices
        $('div#questions>h2').text('Question n°' + questionEnCours.identifiant);
        $('question-en-cours').text(questionEnCours.question);
        $('#indice-img').removeAttr('src');
        $('#indice-img').attr('src', questionEnCours.indiceImg);
        if(questionEnCours.indiceTxt){
            $('#indice-txt').text(questionEnCours.indiceTxt);
        };

//  Affichage des réponses
        $('input[name=q1]:radio').removeAttr('value');
        $('input#rep1').attr('value', questionEnCours.reponses[1]);
        $('input#rep1 + label').text(questionEnCours.reponses[1]);
        $('input#rep2').attr('value', questionEnCours.reponses[2]);
        $('input#rep2 + label').text(questionEnCours.reponses[2]);
        $('input#rep3').attr('value', questionEnCours.reponses[3]);
        $('input#rep3 + label').text(questionEnCours.reponses[3]);
        $('input#rep4').attr('value', questionEnCours.reponses[4]);
        $('input#rep4 + label').text(questionEnCours.reponses[4]);
    };
    


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
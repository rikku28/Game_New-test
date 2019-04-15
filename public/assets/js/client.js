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
        var socket = io();

// Date et timestamp de la date du jour
        var dateJour = new Date();
        var timestamp=dateJour.getTime(dateJour);
        var players = [];
        var premiereConnexion = false;

/******************************************* Actions côté client ********************************************/
        log('Coucou côté client');
// On masque toutes les balises sauf celles du formulaire de connexion.
        $('.cache-header').hide();
        $('.cache-login-form').hide();
        $('.cache-quiz').hide();
        $('.cache-infos-joueurs').hide(); // à la place de .fadeOut()

// Joueur déjà inscrit :
        $('#welcomeBack').click(function(e){
            // e.preventDefault();
            premiereConnexion = false;
            $('.cache-login-form').show();
            $('.img-avatar').hide();
            $('#btn-connexion').hide();
        });

// Inscription d'un nouveau joueur :
        $('#firstConnexion').click(function(e){
            // e.preventDefault();
            premiereConnexion = true;
            $('.cache-login-form').show();
            $('#btn-connexion').hide();
        });

       
// Formulaire de connnexion : Récupération, puis envoi des infos de connexion au serveur
    let loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', function(event){
        event.preventDefault();

        socket.emit('login', {
            firstLogin: premiereConnexion,
            pseudo : $('#login-form-pseudo').val(),
            mdp: $('#login-form-mdp').val(),
            img: $('#login-form-avatar').val()
        });
    });

// Evènements liés à la vérification en BDD des infos de connextion
socket.on('badPseudo', function(info){
    log(`badPseudo`);
    $('#login-form').prepend('<p class="text-danger msg-login-incorrect" id="badPseudo"><strong>Votre mot de passe est vide ou invalide.</strong></p>');
});

socket.on('alreadyUsedPseudo', function(info){
    log(`alreadyUsedPseudo`);
    $('#date-jour').prepend('<p class="text-warning msg-login-incorrect" id="alreadyUsedPseudo"><strong>' + info.msg + '</strong></p>');
});


socket.on('badPwd', function(info){
    log(`badPwd`);
    $('#date-jour').prepend('<p class="text-danger msg-login-incorrect" id="badPwd"><strong>' + info.msg + '</strong></p>');
});

socket.on('badAvatar', function(info){
    log(`badAvatar`);
    $('#date-jour').prepend('<p class="text-danger msg-login-incorrect" id="badAvatar"><strong>' + info.msg + '</strong></p>');
});

socket.on('badInfos', function(info){
    log(`badInfos`);
    $('#date-jour').prepend('<p class="text-danger msg-login-incorrect" id="badInfos"><strong>' + info.msg + '</strong></p>');
});

socket.on('userUnknown', function(info){
    log(`userUnknown`);
    $('#date-jour').prepend('<p class="text-danger msg-login-incorrect" id="userUnknown"><strong> Joueur introuvable. Veuillez vous connecter avec les bons identifiants, ou vous inscrire si c\'est la 1ère fois que vous participez au quiz Pokémon.</strong></p>');
    $('.cache-login-form').hide();
    $('#btn-connexion').fadeIn();
});

// Nouveau joueur connecté
    socket.on('loginOK', function(infos){
        log(`Pseudo transmis au joueur connecté : ${infos}`);
        $('#login-form').remove();
        $('.cache-header').fadeIn();
        $('.cache-infos-joueurs').show(); // ou .fadeIn()?
        $('#welcome').html('<h1 style="font-size: 3em">Bienvenue ' + infos.pseudo + ' <img src="' + infos.avatar + '" width="75px"/></h1>');
        players.push(infos.pseudo);
        log(players);
        $('section#quiz').append('<p>Répondez à 10 questions plus vite que votre adversaire pour gagner des points.</p>')
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
            $('#online-scores').append('<p class="infos-joueurs" id="' + infos[player].identifiant + '"><img src="' + infos[player].avatar + '" class="rounded" width="50px"/> ' + infos[player].pseudo + ' - Score : <span class="score">' + infos[player].score + '</span></p>');
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

        // for (var player in infos){
        //     $('#online-scores').append('<p class="infos-joueurs" id="' + infos[player].identifiant + '"><img src="' + infos[player].avatar + '" width="50px"/> ' + infos[player].pseudo + ' - Score : <span class="score">' + infos[player].score + '</span></p>');
        // }

        $('#zone-infos').prepend('<p><strong><em>La partie commence : Question n°0!</em></strong></p>');
        $('.cache-quiz').show();
        currentQuestion(q0);
        // showQuestion(q0);    // setTimeout qui se déclenche avant "l'écoute" de "startGame".
    });

    $('#btn-start-game').click(function(e){
        e.preventDefault();
        socket.emit('start-game');
    })

    
    $('#question-form').click(function(e){
        e.preventDefault();
        // clearTimeout(premQuestion);

        var reponseSelectionnee = $('input[name=q1]:checked').val();
        log(reponseSelectionnee);
        socket.emit('answer', reponseSelectionnee);
    });
    
    socket.on('nextQuestion', function(qEnCours){
        log(qEnCours);
        $('#zone-infos').prepend('<p><em>Question n°' + qEnCours.tour +'!</em></p>');
        $('.cache-quiz').show();
        currentQuestion(qEnCours);
    });

    socket.on('bravo', function(infos){
        log(infos);
        $('#zone-infos').prepend('<p class="text-success"><em>' + infos.pseudo + ' remporte le point. </em></p>');
        let laDivDuJoueur = document.getElementById(infos.id);
        $(laDivDuJoueur).remove();
        $('#online-scores').append('<p class="infos-joueurs" id="' + infos.id + '"><img src="' + infos.img + '" width="50px"/> ' + infos.pseudo + ' - Score : <span class="score">' + infos.score + '</span></p>');
    });

    socket.on('dommage', function(infos){
        log(infos);
        $('#zone-infos').prepend('<p class="text-danger"><em> Ce n\'est pas la bonne réponse ' + infos.pseudo + '. Réessayez.</em></p>');
        // if(questionEnCours.indiceTxt){
        $('#indice-txt').text('Indice : ' + infos.indiceTxt);
        // };
    });


    socket.on('endGame', function(infos){
        $('#zone-infos').prepend('<p><strong><em>' + infos.msg + '</em></strong></p>');
        log(infos);
        $('.cache-quiz').hide();

        // let tabPlayers = Object.entries(infos.players);
        let tabPlayers = [];
        for(var key in infos){
            tabPlayers.push(infos[key]);
        }
        log(tabPlayers);

        tabPlayers.sort(function(a, b){
            return b.score - a.score
        });

        for (var i = 0; i < tabPlayers.length; i++) {
            tabPlayers[i].rank = i + 1;
        }
        
        log(tabPlayers);

        $('#online-scores').empty();

        // $('#zone-infos').prepend('<p class="text-warning bg-primary"><strong> Félicitations ' + tabPlayers[0][1].pseudo + '. Vous remportez la partie.</strong></p>');
        $('#zone-infos').prepend('<p class="text-warning bg-primary"><strong> Félicitations ' + tabPlayers[0].pseudo + '. Vous remportez la partie.</strong></p>');

        $.each(tabPlayers, function(index, value) {
            log(index + ' ' + value);
            // log('Pseudo : ' + tabPlayers[index][1].pseudo);
            log('Pseudo : ' + tabPlayers[index].pseudo);

            // $('#online-scores').append('<p class="fin-partie" id="end-' + tabPlayers[index][1].identifiant + '"><img src="' + tabPlayers[index][1].avatar + '" class="rounded" width="50px"/> ' + tabPlayers[index][1].pseudo + ' - Score : <span class="score">' + tabPlayers[index][1].score + '</span></p>');

            $('#online-scores').append('<p class="fin-partie" id="end-' + tabPlayers[1].identifiant + '"><img src="' + tabPlayers[1].avatar + '" class="rounded" width="50px"/> ' + tabPlayers[1].pseudo + ' - Score : <span class="score">' + tabPlayers[1].score + '</span></p>');
        });
    });

    socket.on('classement', function(infos){
        log(`On est dans le classement des joueurs.`);
        // let tabRanking = Object.entries(infos);
        let tabRanking = infos;
        log(tabRanking);
        $('#all-best-scores').empty();
        
        $.each(tabRanking, function(index, value) {
            log(index + ' ' + value);
            $('#all-best-scores').append('<p class="fin-partie col-md-5 offset-md-1" id="end-' + tabRanking[index].identifiant + '"><img src="' + tabRanking[index].avatar + '" class="rounded" width="40px"/> ' + tabRanking[index].pseudo + ' - Score : <span class="score">' + tabRanking[index].bestScore + '</span></p>');
        });

        // let i = 0;
        // tabRanking.forEach(function(rank){
        //     log(i);
        //     $('#all-best-scores').append('<p class="fin-partie col-md-5 offset-md-1" id="end-' + tabRanking[rank].identifiant + '"><img src="' + tabRanking[rank].avatar + '" class="rounded" width="40px"/> ' + tabRanking[rank].pseudo + ' - Score : <span class="score">' + tabRanking[rank].bestScore + '</span></p>');
        //     i++
        // });

        // tabRanking.sort(function(a, b){
        //     return b.bestScore - a.bestScore
        // });
        // log(tabRanking);
        
        // for (var rank in tabRanking){
        //     $('#online-scores').append('<p class="fin-partie col-md-5 offset-md-1" id="end-' + tabRanking[rank].identifiant + '"><img src="' + tabRanking[rank].avatar + '" class="rounded" width="40px"/> ' + tabRanking[rank].pseudo + ' - Score : <span class="score">' + tabRanking[rank].bestScore + '</span></p>');
        // }
    });

/*********************************** Affichage de la question en cours *******************************************/
    // var showQuestion = setTimeout(function(question){
    //     $('.cache-quiz').show();
    //     currentQuestion(question);
    // }, 5000);

    var currentQuestion = function(questionEnCours){
// Affichage de la question et ses indices
        // $('div#questions>h2').text('Question n°' + questionEnCours.identifiant);
        $('#indice-txt').empty();
        $('div#questions>h2').text('Question n°' + questionEnCours.tour);
        log('Question n°' + questionEnCours.identifiant);
        $('#question-en-cours').text('Question : '+ questionEnCours.question);
        $('#indice-img').removeAttr('src');
        let indiceEnImage = 'assets/img/indices/' + questionEnCours.indiceImg;
        log(indiceEnImage);
        $('#indice-img').attr('src', indiceEnImage);
        // $('#indice-img').attr('src', questionEnCours.indiceImg);

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
            const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']; 
            let indexMois = dateJour.getMonth();   // getMonth() va de 0 à  11, 0 correspondant au mois de Janvier et 11 au mois de Décembre. 
            const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    // let jour = jours[indexJour] + ' ' + numeroJour + ' ' + mois[indexMois] + ' ' + annee; 
            // console.log(jour); 
            let txtDate = document.createTextNode('Nous sommes le ' + jours[indexJour] + ' ' + numeroJour + ' ' + mois[indexMois] + ' ' + dateJour.getFullYear());
            todayP.appendChild(txtDate);
        })();
    });
})(window, io);
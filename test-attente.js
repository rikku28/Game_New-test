
// Attente d'un adversaire - serveur

var attenteJoueur = null;

if (attenteJoueur){
    // On lance le jeu
    attenteJoueur = null;

    socket.emit()
} else{
    attenteJoueur = socket;
    attenteJoueur.emit('messageAttente', 'Recherche d\'un adversaire');
}





// Attente d'un adversaire - client
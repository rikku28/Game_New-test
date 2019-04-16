# Quiz Pokémon multijoueurs

URL du quiz : http://rikku28.herokuapp.com/
Quiz réalisé en javascript avec Node.js, Express JS, Socket.IO, MongoDB et jQuery.

## Table of Contents

<!-- MarkdownTOC autolink=true bracket=round depth=2 -->
- [Concept du Projet](#Concept-du-Projet)
- [Arborescence du projet](#Arborescence-du-projet)
- [Installation](#installation)
- [Hébergement](#Hébergement)
<!-- - [Options](#options)
  - [Game_New-test options](#Game_New-test-options)
  - [http-proxy events](#http-proxy-events)
  - [http-proxy options](#http-proxy-options)
- [WebSocket](#websocket)
  - [External WebSocket upgrade](#external-websocket-upgrade) -->
- [Changelog](#changelog)
- [License](#license)
- [Remerciements](#Remerciements)

<!-- /MarkdownTOC -->

## Concept du Projet

Single page game, où l'utilisation de Socket.IO permet l'actualisation des contenus sans avoir à recharger la page.

### Pourquoi un quiz multijoueur?

Dans le cadre de la formation commencée fin novembre 2018, pour devenir dév. full stack JS, un jeu c.v. avait été réalisé début 2019 pour valider les compétences acquises en front end.
A présent, il s'agît de valider les connaissances acquises en back end. Pour cela, il a été demandé de réaliser un jeu multi joueurs.

### Et les Pokémon, dans l'histoire?
Afin de rester dans la continuité du projet front-end (capture de de Lokhlass) et de mon C.V. (thème Pikachu), j'ai choisi de faire un quiz multi-joueurs sur le thème des Pokémon.

### Règles du quizz
Il s'agît d'un quiz de rapidité.
- S'inscrire en mettant un superbe avatar (Google images est votre ami pour trouver l'url d'un avatar sympa). :p
- 2 joueurs minimum.
- Défi sur 25 questions
- Attention : Il faut cliquer dans le bouton radio correspondant à sa réponse pour la valider.
- Le 1er joueur qui donne la bonne réponse remporte le point.

Bonne chance à tous et que le meilleur gagne!

## Arborescence du projet

- **"server.js"** : Ce fichier contient le code javascript qui constitue le serveur du site.

- **"config"** : Ce dossier contient un module et la liste des questions
    - **"check-login.js"** : module permettant de procéder à la vérification des infos de connexion (pseudo et pass non vide + url de l'avatar valide)
    - **"questions.json"** : liste des questions, à importer dans une base (MongoDB dans mon cas).

- **"public"** : Dossier contenant le code front
    - **"index-projet-back.html"** : page HTML du jeu

    - **"favicon.ico"** : favicon du jeu
    
    - **"assets"** : Dossier contenant les fichiers complémentaires
        - **"css"** : Dossier qui contient la feuille de style du jeu + les CSS de la librairie Bootstrap
            - **"quiz-style.css"** : Feuille de style du jeu
        - **"img"** : Dossier qui contient les images visibles sur la page, les indices et les icônes
            - **"indices"** : Dossier qui contient les images affichées en tant qu'aide
        - **"js"** : Dossier qui contient le code javascript client + les fichiers JS de la librairie Bootstrap
            - **"client.js"** : Ce fichier contient le code javascript exécuté côté front.
        - **"pdf"** : Dossier qui contient les fichiers pdf relatifs à l'app (en l'occurence, mon C.V.).

## Installation

Pour installer ce quiz, il vous faut installer les modules Nodes.js suivants, dispos sur NPM:
- socket.io
- express
- mongodb
- nodemon (dev dependecie uniquement)

ou les installer directement à partir du fichier "package.json".

```javascript
$ npm install
```

## Hébergement

L'app est actuellement hébergée chez [Heroku](https://www.heroku.com/). J'ai utilisé leur add-on [mLab](https://www.mlab.com/) pour créer ma base MongoDB.

## Structure de la base de données : 
La base contient 2 collections : "questions" et "users".

- **"questions"**

La collection "questions" regroupe actuellement 25 documents, correspondant chacun à une question différente. J'ai choisi de stocker les questions en base plutôt que d'appeler un fichier .json, afin, entre autre, d'en ajouter ultérieurement.

Exemple de document de cette collection : 

```
{
    "_id": {
        "$oid": "ID généré par la BDD"
    },
    "identifiant": "0",
    "question": "Quelle est la date de sortie des 1ers jeux Pokémon, versions Bleue et Rouge, en Europe?",
    "nbReponses": 4,
    "reponses": {
        "1": "8 octobre 1999",
        "2": "1er avril 1997",
        "3": "27 février 1996",
        "4": "16 juin 2000"
    },
    "bonneRep": 1,
    "indiceTxt": "1 mois et 3 jours après la 1ère diffusion de l'animé sur \"Fox Kids\", 3 mois avant la diffusion sur TF1.",
    "indiceImg": "indice_q0.png",
    "indiceImgUrl": "https://www.squarepalace.com/sites/default/files/actualites/6380/pokemonrb01.png",
    "commentaire": "Le 1er épisode de la série TV Pokémon, \"Le départ\", a été diffusé le 1er avril 1997. Il a fallu attendre le 05 septembre 1999 pour le voir en France."
}
```

- **"users"**

La collection "users" stocke les informations des joueurs. Le champ "lastScore" est mis à jour à la volée, dès que l'utilisateur remporte un point. Tandis que "bestScore" n'est mis à jour qu'en fin de partie, si la valeur de "lastScore" est supérieure à la sienne.

Exemple de document de cette collection : 
```
{
    "_id": {
        "$oid": "5cadbc38fb6fc01d56643200"
    },
    "pseudo": "Rikku",
    "pwd": "un mot de passe",
    "avatar": "https://orig00.deviantart.net/0078/f/2014/178/a/8/untitled_by_vampiregodesnyx-d7o79hw.jpg",
    "bestScore": 18,
    "lastScore": 18
}
```

<!-- - **contexte**:
- **options**: -->

<!-- ## Projet

Proxy `/api` requests to `http://localhost:3333/`

```javascript
var express = require('express')
var proxy = require('Game_New-test')

var app = express()

app.use('/api', proxy({ target: 'http://localhost/', changeOrigin: true }))
app.listen(3000)

// http://localhost:3000/ -> http:// *l'IP en question* :3333/
``` -->
<!-- 

## Example

N°1

```javascript
exemple code
```


## WebSocket

```javascript
// verbose api
proxy('/', { target: 'http://echo.websocket.org', ws: true })

// shorthand
proxy('http://echo.websocket.org', { ws: true })

// shorter shorthand
proxy('ws://echo.websocket.org')
```

### External WebSocket upgrade

In the previous WebSocket examples, Game_New-test relies on a initial http request in order to listen to the http `upgrade` event. If you need to proxy WebSockets without the initial http request, you can subscribe to the server's http `upgrade` event manually.

```javascript
var wsProxy = proxy('ws://echo.websocket.org', { changeOrigin: true })

var app = express()
app.use(wsProxy)

var server = app.listen(3000)
server.on('upgrade', wsProxy.upgrade) // <-- subscribe to http 'upgrade'
```

## Tests

Run the test suite:

```bash
# install dependencies
$ npm install

# linting
$ npm run lint

# unit tests
$ npm test

# code coverage
$ npm run cover
```

:bulb: **Tip:**  -->

## Changelog

- [View changelog](https://github.com/rikku28/Game_New-test/master/CHANGELOG.md)

## License

The MIT License (MIT)

Copyright (c) 2019 Amélie GAUDILLÈRE-MARTIN

## Remerciements

J'en profite pour remercier les Foireux, les Nobles et les Black Diamonds pour leur soutien et les tests. :D
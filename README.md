# VacuumWars - LauzHack 2018
> View on DevPost [https://devpost.com/software/vacuumwars](https://devpost.com/software/vacuumwars)

![Preview](https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/software_photos/000/728/612/datas/gallery.jpg)
## About & Inspiration

Never heard about a multiplayer game about vacuum machines? This is **VacuumWars**, the first ever battle game between vacuums where you can shot missiles to others and compete for who collects the more trash. You will get powerups, and the possibility to push other players just to annoy them. The inspiration for this game was to create a complete different game with new mechanics and fun to play!

## Mechanics

So you are a vacuum machine, and you have two action buttons: "Move" and "Action". While no button is pressed, the vacuum is spinning on itself, but when you press the *move button* you start advancing wherever you are pointing at. You can collect **PowerUps** which will give you a little advantatge for a small amout of time. You just have to collect as many trash as you can (there are different kinds!) and try to make others lose points by shooting them.

## How we built it:

We wanted to learn about new technologies we never worked before, such as Socket.io, Node.js and creating videogames.

- The UI, is an HTM5 canvas for the main screen where we used Paper.js, and for the controller screen we used basically HTML, CSS and JS.
- The event service, is a NodeJS/Socket.io server which serves all the information of the board and updates all what is new and moving.

## Challenges we ran into:

No one on our team ever worked on Node.js and Socket.io before, nor on developing videogames so building this game has been a whole challenge for us. We had to implement the physics of the game and think about all the mecanics, so it wasn't a boring game. We also had to ideate all the multiplayer system and how should we store the variables and which were global.

## Acomplishments we're proud of:

We built a whole game, on our own from scratch. We designed our assets for the game, and didn't use any template. We managed to build a game that has no bugs (found for now), and it is really original and has so many possibilities to integrate on the near future.

## What we've learned

A lot of Socket.io, which we found that is a really interesting tool that for sure we may use in near future, and basics of Node.js another incredibly popular tool that it's too really powerful. We also learned how to use the canvas of the HTML5, and we improved our use of JavaScript. Also how to manage a big project in a short ammount of time and divide tasks.

## What's next?

We have ideas such as implement a lobbys system, new powerUps, new skins (even a skin designer!), new maps and game modes...




---------
> First README.md
# Ideas
A game for the LauzHack that's a frenetic multiplayer battle between many vacuums.

**Base**: Aspiradores que lluiten per aspirar el màxim de merda. Fins a 100 jugadors.

## Mapes
Hi ha +3 mapes.
- El sotano, van amb llanternes.
- Tipus de terra. (moqueta, parquet i terra)
- Diferents materials (Liquid, Paper, Cereals, Boles de pols, Bitxos...)
- Hi ha escales i et pots caure

### Per millorar
- Diferents sales de lluita
- Desde el mobil veus lo que la aspiradora
- Fer una especie de gravetat

## PowerUps:
Cada 5 boles de paper buanyes un power up o tels troves

- Missils: Cau merda i perd punts
- Cables: Trampa
- Bateria: Mes potencia de aspiracio.
- Missil que et bloqueja
- Et canvia la direccio de rotació
- Més Velocitat / Menys velocitat
- T'amplies l'aspiradora. (+punts)
- Pots reduïr un enemic. (-punts)
- Pots fer que un company vagi amb lag
- Apagar la llum
- Alguns carreguen

## Estats
- Bloquejat:
- Mort: 


## Mecaniques

- Quan t'espatlles et venen a arreclar i poden atacat el teu reparador.
- La bossa s'emplena i l'has de buidar
- Auto detonarse, quants mes punts tens mes explotes (Si tens menys de 50 punts no mates)
- El que te mes punts te una corona i si la te durant molt de rato rebenta a tothom.
- Algo que embossi la aspiradora 
- Hi ha animals que deixen pels i els has de recollir


## Skins
Es generen automaticament amb parameteres random.
Pots desbloquejar-ne per "desafios"

### Tipus
- Henry (tipica de yaya)
- Una mini de ma
- Una autonoma
- De lauzhack
- Amb la cara d'algú

### Color
- Tots

## App
- els punts
- la skin
- refresh de la skin
- boto avançar
- boto acció (surt el dibuix del powerup)
- fa el soroll de l'aspiradora
- vibra quan et desplaces.

## Visualitzador
- Interactua amb el mapa(obrint i tencant portes, posant merda...)
- Interactua amb jugadors
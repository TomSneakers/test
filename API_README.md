
# Gym API

## Description

Cette API est conçue pour une application de gestion de séances de sport, de nutrition, et de relations sociales. Elle permet aux utilisateurs de s'inscrire, de se connecter, de créer des groupes d'amis, de gérer des entraînements, d'ajouter des amis et bien plus encore.

## Installation

1. Clonez le repository.
2. Installez les dépendances avec `npm install`.
3. Configurez les variables d'environnement, en particulier `MONGODB_URI` et `JWT_SECRET`.
4. Lancez le serveur avec `npm start`.

## Routes API

### Authentification

- **POST /signup** : Inscription d'un nouvel utilisateur.
  - Champs requis : `firstName`, `lastName`, `age`, `email`, `phone`, `password`.
- **POST /login** : Connexion d'un utilisateur existant.
  - Champs requis : `email`, `password`.

### Gestion des utilisateurs

- **PUT /users/:userId** : Mettre à jour les informations de l'utilisateur.
- **POST /users/:userId/add-friend** : Ajouter un ami à l'utilisateur.
  - Champs requis : `friendId`.
- **DELETE /users/friends/:friendId** : Supprimer un ami de l'utilisateur.
- **GET /users/friends** : Récupérer la liste des amis de l'utilisateur.
- **GET /users/search** : Rechercher des utilisateurs par nom, prénom, email, téléphone ou ID.
  - Paramètre de requête : `query`.

### Groupes d'amis

- **POST /groups** : Créer un nouveau groupe d'amis.
- **POST /groups/:groupId/add-member/:memberId** : Ajouter un membre à un groupe.
- **POST /groups/:groupId/remove-member/:memberId** : Retirer un membre d'un groupe.
- **DELETE /groups/:groupId** : Supprimer un groupe.

### Entraînements

- **POST /workouts** : Créer un nouvel entraînement.
- **GET /workouts** : Récupérer les entraînements d'un utilisateur.
- **DELETE /workouts/:workoutId** : Supprimer un entraînement.

## Middleware

- **authenticateToken** : Middleware pour vérifier le token JWT et authentifier les utilisateurs.

## Modèles

### User

- `firstName`: String, requis
- `lastName`: String, requis
- `age`: Number, requis
- `email`: String, requis, unique
- `phone`: String, requis
- `password`: String, requis
- `role`: String, enum: ['user', 'admin'], default: 'user'
- `friends`: Array of ObjectId (User), liste des amis

### Group

- `name`: String, requis
- `description`: String
- `members`: Array of ObjectId (User), membres du groupe
- `createdBy`: ObjectId (User), créateur du groupe

### Workout

- `name`: String, requis
- `description`: String
- `exercises`: Array of ObjectId (Exercise), liste des exercices
- `createdBy`: ObjectId (User), créateur de l'entraînement

### Exercise

- `type`: String, enum: ['cardio', 'physical'], requis
- `cardio`: Schema pour les exercices cardio
- `physical`: Schema pour les exercices physiques

## Sécurité

Les routes sont protégées par un middleware `authenticateToken` qui vérifie le token JWT pour s'assurer que seules les requêtes authentifiées sont traitées.

## Auteur

API créée par [Votre Nom].

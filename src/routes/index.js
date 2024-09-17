const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/userModel');
const postController = require('../controllers/postController');
const workoutCoachController = require('../controllers/workoutCoachController');


const authController = require('../controllers/authController');
const groupController = require('../controllers/groupController');
const workoutController = require('../controllers/workoutController');
const messageController = require('../controllers/messageController');
const challengeController = require('../controllers/challengeController') // Correction : chemin correct du contrôleur
const { authenticateToken } = require('../middleware/authMiddleware');



// Route pour récupérer tous les coachs
router.get('/users/coaches', authenticateToken, authController.getCoaches);
// Route pour récupérer les amis de l'utilisateur
router.get('/users/friends', authenticateToken, authController.getFriends);

router.get('/users/friend-requests', authenticateToken, authController.getFriendRequests);
// Route pour rejeter une demande d'ami
router.post('/users/reject-friend', authenticateToken, authController.rejectFriendRequest);

// Route pour la recherche d'utilisateurs
router.get('/users/search', authenticateToken, async (req, res) => {
    try {
        const { query } = req.query;
        let searchCriteria = [
            { firstName: { $regex: query, $options: 'i' } },
            { lastName: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { phone: { $regex: query, $options: 'i' } },
        ];

        // Ajouter la recherche par _id uniquement si l'id est valide
        if (mongoose.Types.ObjectId.isValid(query)) {
            searchCriteria.push({ _id: query });
        }

        const users = await User.find({
            $or: searchCriteria
        }).select('-password');

        res.status(200).json(users);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});




// Route pour ajouter un client
router.post('/users/:userId/add-client', authenticateToken, authController.addClient);
router.get('/users/:userId/clients', authenticateToken, authController.getClients);
router.delete('/users/:userId/remove-client/:clientId', authenticateToken, authController.removeClient);
router.get('/users/me/coach-data', authenticateToken, authController.getCoachData);


// Routes pour les posts (Actualités)
router.post('/posts', authenticateToken, postController.createPost);
router.get('/posts', authenticateToken, postController.getFriendPosts);
router.get('/user/posts', authenticateToken, postController.getUserPosts);
router.delete('/posts/:postId', authenticateToken, postController.deletePost);
router.put('/posts/:postId', authenticateToken, postController.updatePost);
router.post('/posts/:postId/comments', authenticateToken, postController.addComment);
router.post('/posts/:postId/like', authenticateToken, postController.toggleLike);

// Routes pour l'authentification
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.put('/users/:userId', authController.updateUserProfile);

// Route pour la mise à jour du profil utilisateur
router.get('/users/:userId', authenticateToken, authController.getUserDetails);

// Route pour uploader la photo de profil
router.put('/users/:userId/profile-picture', authenticateToken, authController.uploadProfilePicture);

// Routes pour les amis
router.post('/users/:userId/add-friend', authenticateToken, authController.addFriend);
router.delete('/users/friends/:friendId', authenticateToken, authController.removeFriend);
router.post('/users/accept-friend', authenticateToken, authController.acceptFriendRequest);


// Routes pour les groupes
router.post('/groups', authenticateToken, groupController.createGroup);
router.get('/groups', authenticateToken, groupController.getUserGroups);
router.post('/groups/:groupId/add-members', authenticateToken, groupController.addMembers);
router.post('/groups/:groupId/remove-member/:memberId', authenticateToken, groupController.removeMember);
router.delete('/groups/:groupId', authenticateToken, groupController.deleteGroup);
router.post('/groups/:groupId/leave', authenticateToken, groupController.leaveGroup);
router.get('/groups/:groupId/members', authenticateToken, groupController.getGroupMembers);


// Routes pour les messages
router.post('/groups/:groupId/messages', authenticateToken, messageController.sendMessage);
router.get('/groups/:groupId/messages', authenticateToken, messageController.getGroupMessages);

// Routes pour les défis
router.post('/groups/:groupId/challenges', authenticateToken, challengeController.createChallenge);
router.get('/groups/:groupId/challenges', authenticateToken, challengeController.getChallengesByGroup);
router.post('/challenges/:challengeId/validate', authenticateToken, challengeController.validateChallenge);
router.get('/challenges/:challengeId/results', authenticateToken, challengeController.getChallengeResults);

// Routes pour les entraînements
router.post('/workouts', authenticateToken, workoutController.createWorkout); // Créer un entraînement
router.get('/workouts', authenticateToken, workoutController.getUserWorkouts); // Récupérer les entraînements d'un utilisateur
router.delete('/workouts/:workoutId', authenticateToken, workoutController.deleteWorkout);
router.get('/workouts/:workoutId', authenticateToken, workoutController.getWorkoutById);
router.put('/workouts/:workoutId', authenticateToken, workoutController.updateWorkout);

// Routes pour les entraînements des coachs
router.get('/clients/:clientId/workouts-coach/:workoutId', authenticateToken, workoutCoachController.getWorkoutById);
router.put('/clients/:clientId/workouts-coach/:workoutId/add-exercise', authenticateToken, workoutCoachController.addExerciseToWorkout);
router.post('/workouts-coach', authenticateToken, workoutCoachController.createWorkoutCoach);
router.get('/clients/:clientId/workouts-coach', authenticateToken, workoutCoachController.getWorkoutsByClient);
router.delete('/workouts-coach/:workoutId', authenticateToken, workoutCoachController.deleteWorkoutCoach);
router.put('/clients/:clientId/workouts-coach/:workoutId', authenticateToken, workoutCoachController.updateWorkoutCoach);
router.delete('/clients/:clientId/workouts-coach/:workoutId/exercises/:exerciseId', authenticateToken, workoutCoachController.deleteExerciseFromWorkout);



module.exports = router;

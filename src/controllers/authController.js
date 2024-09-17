const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Configuration de multer pour stocker les fichiers
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads');

        // Vérifier si le dossier existe, sinon le créer
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath); // Dossier où les fichiers seront stockés
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ storage: storage });

// exports.getUserDetails = async (req, res) => {
//     try {
//         const { userId } = req.params;

//         // Valider l'ObjectId
//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//             return res.status(400).json({ message: 'Invalid user ID format' });
//         }

//         const user = await User.findById(userId).select('-password'); // Exclure le mot de passe

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Ajoutez l'URL complète si ce n'est pas déjà le cas
//         if (user.profilePicture && !user.profilePicture.startsWith('http')) {
//             user.profilePicture = `${req.protocol}://${req.get('host')}${user.profilePicture}`;
//         }

//         res.status(200).json(user);
//     } catch (error) {
//         console.error('Error fetching user details:', error);
//         res.status(500).json({ message: 'Server error', error });
//     }
// };
// authController.js

exports.getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'ID utilisateur invalide' });
        }

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Calculer l'âge à partir de la date de naissance
        const today = new Date();
        const birthDate = new Date(user.birthDate);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        res.status(200).json({ ...user.toObject(), age }); // Inclure l'âge dans la réponse
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};


// Fonction pour uploader la photo de profil
exports.uploadProfilePicture = [
    upload.single('profilePicture'),
    async (req, res) => {
        try {
            const { userId } = req.params;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const profilePictureUrl = `/uploads/${req.file.filename}`;
            user.profilePicture = profilePictureUrl;
            await user.save();

            // Renvoie l'URL complète de l'image
            const fullUrl = `${req.protocol}://${req.get('host')}${profilePictureUrl}`;

            res.status(200).json({
                message: 'Profile picture updated successfully',
                user: {
                    ...user.toObject(),
                    profilePicture: fullUrl
                }
            });
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    }
];

// Fonction d'inscription
exports.signup = async (req, res) => {
    try {
        const { firstName, lastName, birthDate, email, phone, password, height, weight } = req.body;

        // Vérifie si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.error('Email already in use');
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed successfully');

        // Création d'un nouvel utilisateur
        const newUser = new User({
            firstName,
            lastName,
            birthDate: new Date(birthDate), // Assurez-vous que la date est valide
            email,
            phone,
            password: hashedPassword,
            height,
            weight,
        });

        // Sauvegarde de l'utilisateur
        await newUser.save();
        console.log('User saved successfully');
        res.status(201).json({ message: 'User created', user: newUser });
    } catch (error) {
        console.error('Error during signup:', error);  // Ceci aidera à diagnostiquer l'erreur
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { firstName, lastName, birthday, phone, height, weight } = req.body;

        // Trouver l'utilisateur
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Mettre à jour les champs
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.birthDate = birthday ? new Date(birthday) : user.birthDate;  // Assurez-vous que la date est bien mise à jour
        user.phone = phone || user.phone;
        user.height = height || user.height;
        user.weight = weight || user.weight;

        // Sauvegarder les modifications
        await user.save();

        res.status(200).json({ message: 'User profile updated successfully', user });
    } catch (error) {
        console.error("Error in updateUserProfile:", error);
        res.status(500).json({ message: 'Server error', error });
    }
};




exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Le jeton expire après 1 jour
        );

        res.status(200).json({ token, userId: user._id, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Route pour envoyer une demande d'ami
exports.addFriend = async (req, res) => {
    try {
        const { userId } = req.user;
        const { friendId } = req.body;

        console.log("User ID:", userId);
        console.log("Friend ID:", friendId);

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(friendId)) {
            console.log("Invalid ID format");
            return res.status(400).json({ message: "Invalid user or friend ID format" });
        }

        if (userId === friendId) {
            console.log("User tried to add themselves as a friend");
            return res.status(400).json({ message: "You cannot add yourself as a friend" });
        }

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        console.log("User found:", user);
        console.log("Friend found:", friend);

        if (!friend) {
            console.log("Friend not found");
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.friendRequests.includes(friendId)) {
            console.log("Friend request already sent");
            return res.status(400).json({ message: 'Friend request already sent' });
        }

        if (user.friends.includes(friendId)) {
            console.log("Users are already friends");
            return res.status(400).json({ message: 'User is already your friend' });
        }

        // Ajouter l'ID de l'utilisateur dans les demandes d'amis de l'ami, sans validation des champs requis
        friend.friendRequests.push(userId);
        await friend.save({ validateBeforeSave: false });

        console.log("Friend request sent successfully");

        res.status(200).json({ message: 'Friend request sent successfully' });
    } catch (error) {
        console.error('Error adding friend:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Route pour accepter une demande d'ami
exports.acceptFriendRequest = async (req, res) => {
    try {
        const { userId } = req.user; // L'utilisateur qui accepte la demande
        const { friendId } = req.body; // L'utilisateur dont la demande est acceptée

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(friendId)) {
            return res.status(400).json({ message: "Invalid user or friend ID format" });
        }

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        console.log("User found:", user);
        console.log("Friend found:", friend);

        if (!friend) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.friendRequests.includes(friendId)) {
            return res.status(400).json({ message: 'No friend request from this user' });
        }

        // Supprimer la demande d'ami
        user.friendRequests = user.friendRequests.filter(id => id.toString() !== friendId);
        user.friends.push(friendId);
        await user.save({ validateBeforeSave: false }); // Désactiver la validation complète ici

        // Ajouter l'utilisateur à la liste des amis de l'autre utilisateur
        friend.friends.push(userId);
        await friend.save({ validateBeforeSave: false }); // Désactiver la validation complète ici

        console.log("Friend request accepted successfully");

        res.status(200).json({ message: 'Friend request accepted', friends: user.friends });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Route pour rejeter une demande d'ami
exports.rejectFriendRequest = async (req, res) => {
    try {
        const { userId } = req.user; // L'utilisateur qui rejette la demande
        const { friendId } = req.body; // L'utilisateur dont la demande est rejetée

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(friendId)) {
            return res.status(400).json({ message: "Invalid user or friend ID format" });
        }

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!friend) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Vérifier si une demande d'ami existe
        if (!user.friendRequests.includes(friendId)) {
            return res.status(400).json({ message: 'No friend request from this user' });
        }

        // Supprimer la demande d'ami du tableau `friendRequests`
        user.friendRequests = user.friendRequests.filter(id => id.toString() !== friendId);
        await user.save({ validateBeforeSave: false }); // Désactiver la validation complète ici

        res.status(200).json({ message: 'Friend request rejected successfully' });
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Route pour récupérer la liste des amis
exports.getFriends = async (req, res) => {
    try {
        const { userId } = req.user;

        const user = await User.findById(userId).populate('friends', 'firstName lastName email phone profilePicture');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.friends);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Route pour récupérer les demandes d'amis en attente
exports.getFriendRequests = async (req, res) => {
    try {
        const { userId } = req.user;

        const user = await User.findById(userId).populate('friendRequests', 'firstName lastName email phone profilePicture');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.friendRequests);
    } catch (error) {
        console.error('Error fetching friend requests:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Route pour supprimer un ami
exports.removeFriend = async (req, res) => {
    try {
        const { userId } = req.user;
        const { friendId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(friendId)) {
            return res.status(400).json({ message: "Invalid user or friend ID format" });
        }

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.friends.includes(friendId)) {
            return res.status(400).json({ message: 'User is not your friend' });
        }

        // Supprimer l'ami de la liste des amis de l'utilisateur
        user.friends = user.friends.filter(id => id.toString() !== friendId);
        await user.save({ validateBeforeSave: false }); // Désactiver la validation complète ici

        // Supprimer l'utilisateur de la liste des amis de l'ami
        friend.friends = friend.friends.filter(id => id.toString() !== userId);
        await friend.save({ validateBeforeSave: false }); // Désactiver la validation complète ici

        res.status(200).json({ message: 'Friend removed successfully', friends: user.friends });
    } catch (error) {
        console.error('Error removing friend:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// authController.js

exports.addClient = async (req, res) => {
    try {
        const { userId } = req.params; // L'ID du coach
        const { clientId } = req.body;

        // Trouver le coach et le client
        const coach = await User.findById(userId).populate('clients');
        const client = await User.findById(clientId);

        if (!coach) {
            return res.status(404).json({ message: 'Coach not found' });
        }

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Vérifier si le client est déjà associé à ce coach
        const isClientAlreadyAssociated = coach.clients.some(
            (c) => c._id.toString() === clientId.toString()
        );

        if (isClientAlreadyAssociated) {
            return res.status(400).json({ message: 'This client is already associated with you.' });
        }

        // Vérification du niveau du coach et du nombre de clients
        let maxClients;
        switch (coach.level) {
            case 1:
                maxClients = 10;
                break;
            case 2:
                maxClients = 20;
                break;
            case 3:
                maxClients = Infinity;
                break;
            default:
                maxClients = 10; // Par défaut, 10 clients pour les niveaux non définis
        }

        if (coach.clients.length >= maxClients) {
            return res.status(400).json({ message: `You cannot add more than ${maxClients} clients.` });
        }

        // Ajouter le client à la liste du coach et assigner le coach au client
        coach.clients.push(clientId);
        client.coach = coach._id;

        // Désactiver la validation complète pour éviter les erreurs liées aux champs obligatoires manquants
        await coach.save({ validateBeforeSave: false });
        await client.save({ validateBeforeSave: false });

        res.status(200).json({ message: 'Client added successfully', clients: coach.clients });
    } catch (error) {
        console.error('Error adding client:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.removeClient = async (req, res) => {
    try {
        const { userId, clientId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ message: "Invalid user or client ID format" });
        }

        const coach = await User.findById(userId).populate('clients');
        const client = await User.findById(clientId);

        if (!coach) {
            console.log('Coach not found');
            return res.status(404).json({ message: 'Coach not found' });
        }

        if (!client) {
            console.log('Client not found');
            return res.status(404).json({ message: 'Client not found' });
        }

        console.log('Type of coach.clients:', typeof coach.clients);
        console.log('Type of client._id:', typeof client._id);
        console.log('Client IDs in coach:', coach.clients.map(c => c._id.toString()));
        console.log('Client ID being removed:', client._id.toString());

        // Vérifiez si le client est bien associé au coach
        const isClientAssociated = coach.clients.some(id => id._id.toString() === client._id.toString());
        console.log('Is client associated:', isClientAssociated);

        if (!isClientAssociated) {
            return res.status(400).json({ message: 'This client is not associated with you.' });
        }

        // Supprimer le client de la liste des clients du coach
        coach.clients = coach.clients.filter(id => id._id.toString() !== client._id.toString());
        client.coach = null; // Retirer le coach du client

        // Désactiver la validation pour éviter les erreurs liées aux champs obligatoires manquants
        await coach.save({ validateBeforeSave: false });
        await client.save({ validateBeforeSave: false });

        res.status(200).json({ message: 'Client removed successfully', clients: coach.clients });
    } catch (error) {
        console.error('Error removing client:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// authController.js

exports.getClients = async (req, res) => {
    try {
        const { userId } = req.params;

        // Assurez-vous que l'utilisateur est un coach
        const coach = await User.findById(userId).populate('clients', 'firstName lastName email phone');
        if (!coach || coach.role !== 'coach') {
            return res.status(403).json({ message: "Accès interdit" });
        }

        res.status(200).json(coach.clients);
    } catch (error) {
        console.error('Erreur lors de la récupération des clients:', error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

// authController.js

exports.getCoachData = async (req, res) => {
    try {
        const { userId } = req.user; // Récupérer l'ID de l'utilisateur connecté à partir du middleware d'authentification

        // Trouver l'utilisateur dans la base de données
        const coach = await User.findById(userId).populate('clients', 'firstName lastName email phone');
        if (!coach || coach.role !== 'coach') {
            return res.status(403).json({ message: "Accès interdit, vous n'êtes pas un coach" });
        }

        // Compter le nombre de clients et obtenir le niveau
        const numClients = coach.clients.length;
        const level = coach.level;

        res.status(200).json({ clients: numClients, level });
    } catch (error) {
        console.error('Erreur lors de la récupération des données du coach:', error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};


exports.getCoaches = async (req, res) => {
    try {
        const coaches = await User.find({ role: 'coach' }).select('-password');
        res.status(200).json(coaches);
    } catch (error) {
        console.error('Error fetching coaches:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

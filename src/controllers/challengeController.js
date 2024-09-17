const Challenge = require('../models/challengeModel');
const Message = require('../models/messageModel');


// exports.createChallenge = async (req, res) => {
//     try {
//         const { groupId, type, name, description, repetitions, time } = req.body;
//         const userId = req.user ? req.user.userId : null; // Utilisez req.user.userId

//         console.log("Received data:", { groupId, type, name, description, repetitions, time });
//         console.log("User ID:", userId);

//         if (!groupId || !type || !name || !repetitions) {
//             return res.status(400).json({ message: 'Missing required fields' });
//         }

//         if (!userId) {
//             return res.status(400).json({ message: 'User ID is required' });
//         }

//         // Créer le nouveau défi
//         const newChallenge = new Challenge({
//             groupId,
//             type,
//             name,
//             description,
//             repetitions,
//             time: type === 'cardio' ? time : undefined,
//         });

//         await newChallenge.save();
//         console.log("New challenge created:", newChallenge);

//         // Créer un message associé au défi
//         const newMessage = new Message({
//             groupId,
//             senderId: userId,
//             content: `New Challenge: ${newChallenge.name} - ${newChallenge.description}`,
//             challengeId: newChallenge._id,
//         });

//         await newMessage.save();
//         console.log("New message created:", newMessage);

//         // Récupérer le message populé
//         const populatedMessage = await Message.findById(newMessage._id)
//             .populate('senderId', 'firstName lastName profilePicture')
//             .populate('challengeId');

//         console.log("Populated message:", populatedMessage);

//         res.status(201).json({ messageData: populatedMessage });
//     } catch (error) {
//         console.error("Error during challenge creation:", error);
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };

exports.createChallenge = async (req, res) => {
    try {
        const { groupId, type, name, description, repetitions, time } = req.body;
        const userId = req.user ? req.user.userId : null;

        if (!groupId || !type || !name || !repetitions) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Créer le nouveau défi
        const newChallenge = new Challenge({
            groupId,
            type,
            name,
            description,
            repetitions,
            time: type === 'cardio' ? time : undefined,
        });

        await newChallenge.save();

        // Créer un message associé au défi
        const newMessage = new Message({
            groupId,
            senderId: userId,
            content: `New Challenge: ${newChallenge.name} - ${newChallenge.description}`,
            challengeId: newChallenge._id,
        });

        await newMessage.save();

        // Récupérer le message populé
        const populatedMessage = await Message.findById(newMessage._id)
            .populate('senderId', 'firstName lastName profilePicture')
            .populate('challengeId');

        // Emettre un événement WebSocket
        const io = require('../../serveur').io; // Assurez-vous que 'server.js' exporte 'io'
        io.to(groupId).emit('newMessage', populatedMessage);

        res.status(201).json({ messageData: populatedMessage });
    } catch (error) {
        console.error("Error during challenge creation:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.getChallengesByGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const challenges = await Challenge.find({ groupId }).sort({ createdAt: -1 });
        res.status(200).json(challenges);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}


exports.getChallengeResults = async (req, res) => {
    try {
        const { challengeId } = req.params;

        const challenge = await Challenge.findById(challengeId).populate('results.userId', 'firstName lastName');

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        res.status(200).json(challenge.results);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.validateChallenge = async (req, res) => {
    try {
        const { challengeId } = req.params;
        const { userId, success } = req.body;

        const challenge = await Challenge.findById(challengeId);

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        // Vérifier si l'utilisateur a déjà soumis un résultat
        const existingResult = challenge.results.find(result => result.userId.toString() === userId);

        if (existingResult) {
            // Mettre à jour le résultat existant
            existingResult.success = success;
        } else {
            // Ajouter un nouveau résultat
            challenge.results.push({ userId, success });
        }

        await challenge.save();

        res.status(200).json({ message: 'Challenge result updated successfully', results: challenge.results });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getChallengeResults = async (req, res) => {
    try {
        const { challengeId } = req.params;

        const challenge = await Challenge.findById(challengeId).populate('results.userId', 'firstName lastName');

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        res.status(200).json(challenge.results);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

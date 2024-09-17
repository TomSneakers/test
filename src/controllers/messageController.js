// src/controllers/messageController.js
const Message = require('../models/messageModel');
const Challenge = require('../models/challengeModel');
const mongoose = require('mongoose');

exports.sendMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { content, challengeId } = req.body; // Ajout de challengeId
        const { userId } = req.user;

        const newMessage = new Message({
            _id: new mongoose.Types.ObjectId(),
            groupId,
            senderId: userId,
            content,
            challengeId: challengeId ? new mongoose.Types.ObjectId(challengeId) : null, // Ajouter l'id du challenge si présent
        });

        await newMessage.save();

        const populatedMessage = await Message.findById(newMessage._id)
            .populate('senderId', 'firstName lastName profilePicture')
            .populate('challengeId'); // Populer le challenge

        if (populatedMessage.senderId.profilePicture && !populatedMessage.senderId.profilePicture.startsWith('http')) {
            populatedMessage.senderId.profilePicture = `${req.protocol}://${req.get('host')}${populatedMessage.senderId.profilePicture}`;
        }

        res.status(201).json({ message: populatedMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;

        const messages = await Message.find({ groupId })
            .populate('senderId', 'firstName lastName profilePicture')
            .populate('challengeId') // Populer le challenge
            .sort({ createdAt: 'asc' });

        messages.forEach((message) => {
            if (message.senderId.profilePicture && !message.senderId.profilePicture.startsWith('http')) {
                message.senderId.profilePicture = `${req.protocol}://${req.get('host')}${message.senderId.profilePicture}`;
            }
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

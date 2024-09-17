// models/messageModel.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const messageSchema = new mongoose.Schema({
    uuid: { type: String, default: uuidv4, unique: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }, // Nouveau champ pour les défis
    createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;

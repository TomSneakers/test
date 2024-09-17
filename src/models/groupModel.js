const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Liste des membres du groupe
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Créateur du groupe
    createdAt: { type: Date, default: Date.now }
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;

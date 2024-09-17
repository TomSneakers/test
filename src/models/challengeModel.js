const mongoose = require('mongoose');

const challengeResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    success: { type: Boolean, required: true },
});

const challengeSchema = new mongoose.Schema({
    type: { type: String, enum: ['strength', 'cardio'], required: true },
    name: { type: String, required: true },
    description: { type: String },
    repetitions: { type: Number, required: true },
    time: { type: Number }, // Optionnel, utilisé uniquement pour les défis cardio
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    results: [challengeResultSchema], // Liste des résultats pour ce défi
    createdAt: { type: Date, default: Date.now },
});

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;

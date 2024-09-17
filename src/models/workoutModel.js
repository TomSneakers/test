const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }], // Liste des exercices
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Créateur de l'entraînement
    createdAt: { type: Date, default: Date.now }
});

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;

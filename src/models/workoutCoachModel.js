const mongoose = require('mongoose');

const workoutCoachSchema = new mongoose.Schema({
    name: { type: String, required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ExerciceCoach' }],
    date: { type: Date, default: Date.now },
    notes: { type: String } // Notes supplémentaires sur l'entraînement
});

const WorkoutCoach = mongoose.model('WorkoutCoach', workoutCoachSchema);

module.exports = WorkoutCoach;

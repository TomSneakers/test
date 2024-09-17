// const mongoose = require('mongoose');

// const exerciceCoachSchema = new mongoose.Schema({
//     type: { type: String, required: true },
//     name: { type: String, required: true },
//     duration: { type: Number, required: true }, // En minutes
//     repetitions: { type: Number, required: true },
//     sets: { type: Number, required: true },
//     weight: { type: Number }, // Optionnel, si applicable
//     restTime: { type: Number }, // Temps de repos en secondes
//     notes: { type: String } // Notes supplémentaires
// });

// const ExerciceCoach = mongoose.model('ExerciceCoach', exerciceCoachSchema);

// module.exports = ExerciceCoach;


const mongoose = require('mongoose');

const exerciceCoachSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    targetMuscles: [{ type: String, required: true }],
    equipment: [{ type: String, required: true }],
    difficultyLevel: { type: String, required: true },
    duration: { type: Number, required: true },
    repetitions: { type: Number, required: true },
    sets: { type: Number, required: true },
    restTime: { type: Number },
    goal: { type: String },
    progressionMode: { type: String },
    resourceLink: { type: String },
});

const ExerciceCoach = mongoose.model('ExerciceCoach', exerciceCoachSchema);

module.exports = ExerciceCoach;

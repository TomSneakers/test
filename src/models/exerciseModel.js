const mongoose = require('mongoose');

const cardioSchema = new mongoose.Schema({
    name: { type: String, required: true },
    repetitions: { type: Number, required: true },
    repetitionTime: { type: String, required: true }, // format HH:MM
    restTime: { type: String, required: true } // format HH:MM
});

const physicalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    repetitions: { type: Number, required: true },
    weight: { type: Number, required: true },
    restTime: { type: String, required: true }, // format HH:MM
});

const exerciseSchema = new mongoose.Schema({
    type: { type: String, enum: ['cardio', 'physical'], required: true },
    cardio: cardioSchema,
    physical: physicalSchema,
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;

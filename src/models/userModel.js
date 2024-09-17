
// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     firstName: { type: String, required: true },
//     lastName: { type: String, required: true },
//     age: { type: Number, required: true },
//     email: { type: String, required: true, unique: true },
//     phone: { type: String, required: true },
//     password: { type: String, required: true },
//     role: { type: String, enum: ['user', 'admin'], default: 'user' },
//     friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//     friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Ajout du champ pour les demandes d'amis
//     profilePicture: { type: String },
// });

// const User = mongoose.model('User', userSchema);

// module.exports = User;
// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     firstName: { type: String, required: true },
//     lastName: { type: String, required: true },
//     age: { type: Number, required: true },
//     email: { type: String, required: true, unique: true },
//     phone: { type: String, required: true },
//     password: { type: String, required: true },
//     role: { type: String, enum: ['user', 'admin', 'coach'], default: 'user' },
//     friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//     friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//     profilePicture: { type: String },
//     clients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//     coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Nouveau champ pour le coach
//     level: { type: Number, default: 1 }, // Niveau du coach, par défaut 1

// });

// const User = mongoose.model('User', userSchema);

// module.exports = User;
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthDate: { type: Date, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'coach'], default: 'user' },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    profilePicture: { type: String },
    clients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    level: { type: Number, default: 1 },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
});

const User = mongoose.model('User', userSchema);

module.exports = User;


const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String }, // Chemin de l'image
    createdAt: { type: Date, default: Date.now },
    comments: [commentSchema], // Tableau de commentaires
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Tableau d'IDs d'utilisateurs qui ont aimé
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;

const multer = require('multer');
const path = require('path');
const Post = require('../models/postModel');
const User = require('../models/userModel');
const fs = require('fs'); // Ajoutez cette ligne

// Configuration de multer pour stocker les fichiers
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads/posts');

        // Vérifier si le dossier existe, sinon le créer
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath); // Dossier où les fichiers seront stockés
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ storage: storage });

// Créer un nouveau post avec ou sans image
exports.createPost = [
    upload.single('image'),
    async (req, res) => {
        try {
            const { content } = req.body;
            const authorId = req.user.userId;
            let imageUrl;

            if (req.file) {
                imageUrl = `/uploads/posts/${req.file.filename}`;
            }

            const newPost = new Post({
                content,
                author: authorId,
                image: imageUrl,
            });

            await newPost.save();

            res.status(201).json({ message: 'Post created successfully', post: newPost });
        } catch (error) {
            console.error('Error creating post:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    }
];


// Récupérer les posts visibles par l'utilisateur (ceux de l'utilisateur et de ses amis)

exports.getFriendPosts = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Récupérer les amis de l'utilisateur
        const user = await User.findById(userId).populate('friends', '_id');
        const friendIds = user.friends.map(friend => friend._id);

        // Inclure l'utilisateur lui-même dans la liste des auteurs
        const authors = [...friendIds, userId];

        // Récupérer les posts de l'utilisateur et de ses amis, avec les détails des auteurs, commentaires, et likes
        const posts = await Post.find({ author: { $in: authors } })
            .populate('author', 'firstName lastName email profilePicture')
            .populate('comments.author', 'firstName lastName profilePicture')
            .select('content image author comments likes createdAt')
            .sort({ createdAt: -1 }); // Trie les posts par date de création décroissante

        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};


// Récupérer les posts de l'utilisateur connecté
exports.getUserPosts = async (req, res) => {
    try {
        const userId = req.user.userId;

        const posts = await Post.find({ author: userId })
            .populate('author', 'firstName lastName email profilePicture')
            .populate('comments.author', 'firstName lastName profilePicture')
            .select('content image author comments likes createdAt')
            .sort({ createdAt: -1 }); // Trie les posts par date de création décroissante

        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};


// Mettre à jour un post existant
exports.updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user.userId;

        const post = await Post.findById(postId);

        if (!post || post.author.toString() !== userId) {
            return res.status(404).json({ message: 'Post not found or unauthorized' });
        }

        post.content = content;
        await post.save();

        res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Supprimer un post existant
exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;

        // Trouver le post à supprimer
        const post = await Post.findById(postId);

        // Vérifier si le post existe et s'il appartient à l'utilisateur
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        if (post.author.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Supprimer le post
        await Post.findByIdAndDelete(postId);

        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};



exports.addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user.userId;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = {
            author: userId,
            content,
        };

        post.comments.push(newComment);
        await post.save();

        // Repeupler les commentaires après l'ajout du nouveau commentaire
        const updatedPost = await Post.findById(postId).populate('comments.author', 'firstName lastName profilePicture');

        res.status(201).json({ message: 'Comment added', comments: updatedPost.comments });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};



exports.toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const index = post.likes.indexOf(userId);

        if (index === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();

        // Repeupler les likes après mise à jour
        const updatedPost = await Post.findById(postId).select('likes');

        res.status(200).json({ likes: updatedPost.likes });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};




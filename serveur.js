require('dotenv').config();
const connectDB = require('./src/database');
const app = require('./src/app');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Importez le modèle Message ici
const Message = require('./src/models/messageModel');

connectDB();

const PORT = process.env.PORT || 3000;

// Créer un serveur HTTP à partir de l'application Express
const server = http.createServer(app);

// Initialiser Socket.io avec le serveur HTTP
const io = socketIo(server, {
    cors: {
        origin: "*", // Vous pouvez restreindre cela à des domaines spécifiques si nécessaire
        methods: ["GET", "POST"]
    }
});

// Gérer les connexions WebSocket
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinGroup', (groupId) => {
        socket.join(groupId);
        console.log(`User joined group: ${groupId}`);
    });

    socket.on('sendMessage', async (data) => {
        console.log('sendMessage event received:', data); // Log pour vérifier la réception

        const { groupId, message } = data;

        try {
            // Vérifiez si le message existe déjà par son UUID
            const existingMessage = await Message.findOne({ uuid: message.uuid });
            if (existingMessage) {
                console.log('Duplicate message detected, ignoring.');
                return;
            }

            console.log('Message is unique, proceeding to save.');

            // Sauvegarder le message dans la base de données
            const savedMessage = new Message({
                groupId,
                senderId: message.senderId,
                content: message.content,
                uuid: message.uuid, // Sauvegarder l'UUID
            });

            await savedMessage.save();
            console.log('Message saved to database:', savedMessage);

            // Populer le message avec les informations de l'utilisateur
            const populatedMessage = await Message.findById(savedMessage._id)
                .populate('senderId', 'firstName lastName profilePicture');

            console.log('Message populated with sender details:', populatedMessage);

            // Ajouter l'URL complète de l'image de profil si nécessaire
            if (populatedMessage.senderId.profilePicture && !populatedMessage.senderId.profilePicture.startsWith('http')) {
                populatedMessage.senderId.profilePicture = `${socket.handshake.headers.origin}/uploads/${path.basename(populatedMessage.senderId.profilePicture)}`;
            }

            // Émettre le message à tous les utilisateurs du groupe
            io.to(groupId).emit('newMessage', populatedMessage);
            console.log('Message emitted via WebSocket:', populatedMessage);

        } catch (error) {
            console.error('Error handling sendMessage:', error);
        }
    });

    // Test minimal pour vérifier la communication WebSocket
    socket.on('testMessage', (data) => {
        console.log('testMessage event received:', data);
        io.to(data.groupId).emit('newMessage', data.message);
        console.log('Message emitted in test:', data.message);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
// À la fin de server.js
module.exports = { io };

// Démarrer le serveur HTTP sur tous les ports
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

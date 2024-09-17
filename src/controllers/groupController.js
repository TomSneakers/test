const Group = require('../models/groupModel');
const User = require('../models/userModel');

// Créer un nouveau groupe
exports.createGroup = async (req, res) => {
    try {
        const { name, description, members } = req.body;
        const { userId } = req.user;

        // Debugging: afficher les données reçues
        console.log('Creating group with data:', { name, description, members, userId });

        // Vérifier si tous les membres existent
        const users = await User.find({ _id: { $in: members } });
        if (users.length !== members.length) {
            console.log('One or more members do not exist:', members);
            return res.status(400).json({ message: 'One or more members do not exist' });
        }

        const group = new Group({
            name,
            description,
            members: [userId, ...members], // Ajouter le créateur au groupe
            createdBy: userId
        });

        await group.save();
        console.log('Group created successfully:', group);
        res.status(201).json({ message: 'Group created successfully', group });
    } catch (error) {
        console.error('Server error while creating group:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};


// Récupérer tous les groupes auxquels l'utilisateur appartient
exports.getUserGroups = async (req, res) => {
    try {
        const { userId } = req.user;

        const groups = await Group.find({ members: userId }).populate('members', 'firstName lastName email');
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


// Ajouter des membres à un groupe
exports.addMembers = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { memberIds } = req.body;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Filtrer les membres pour n'ajouter que ceux qui ne sont pas déjà dans le groupe
        const newMembers = memberIds.filter(memberId => !group.members.includes(memberId));

        if (newMembers.length === 0) {
            return res.status(400).json({ message: 'All selected members are already in the group' });
        }

        group.members.push(...newMembers);
        await group.save();

        res.status(200).json({ message: 'Members added successfully', group });
    } catch (error) {
        console.error('Error adding members:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Supprimer un membre d'un groupe
exports.removeMember = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Vérifier si l'utilisateur est membre du groupe
        if (!group.members.includes(memberId)) {
            return res.status(400).json({ message: 'User is not a member of the group' });
        }

        // Supprimer le membre du groupe
        group.members = group.members.filter(id => id.toString() !== memberId);
        await group.save();

        res.status(200).json({ message: 'Member removed successfully', group });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Supprimer un groupe
exports.deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.user;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Vérifier si l'utilisateur est le créateur du groupe
        if (group.createdBy.toString() !== userId) {
            return res.status(403).json({ message: 'Only the group creator can delete this group' });
        }

        await group.remove();
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


// Méthode pour permettre à un utilisateur de quitter un groupe
exports.leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.user;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Vérifier si l'utilisateur est membre du groupe
        if (!group.members.includes(userId)) {
            return res.status(400).json({ message: 'You are not a member of this group' });
        }

        // Retirer l'utilisateur du groupe
        group.members = group.members.filter(id => id.toString() !== userId);
        await group.save();

        res.status(200).json({ message: 'You have left the group', group });
    } catch (error) {
        console.error('Error leaving group:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Récupérer les membres d'un groupe
exports.getGroupMembers = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId).populate('members', 'firstName lastName profilePicture');
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json(group.members);
    } catch (error) {
        console.error('Error fetching group members:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
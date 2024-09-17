const Workout = require('../models/workoutModel');
const Exercise = require('../models/exerciseModel');

// Créer un nouvel entraînement
exports.createWorkout = async (req, res) => {
    try {
        const { name, description, exercises } = req.body;
        const { userId } = req.user;

        console.log('Received workout creation request:', { name, description, exercises, userId });

        // Créer les exercices et les sauvegarder
        const exerciseIds = [];
        for (const exercise of exercises) {
            let newExercise;
            if (exercise.type === 'cardio') {
                newExercise = new Exercise({
                    type: 'cardio',
                    cardio: {
                        name: exercise.name,
                        repetitions: exercise.repetitions,
                        repetitionTime: exercise.repetitionTime,
                        restTime: exercise.restTime,
                    }
                });
            } else if (exercise.type === 'physical') {
                newExercise = new Exercise({
                    type: 'physical',
                    physical: {
                        name: exercise.name,
                        repetitions: exercise.repetitions,
                        weight: exercise.weight,
                        restTime: exercise.restTime,
                    }
                });
            }

            await newExercise.save();
            exerciseIds.push(newExercise._id);
        }

        console.log('Exercises saved:', exerciseIds);

        // Créer l'entraînement avec les exercices associés
        const workout = new Workout({
            name,
            description,
            exercises: exerciseIds,
            createdBy: userId
        });

        await workout.save();
        console.log('Workout saved:', workout);

        res.status(201).json({ message: 'Workout created successfully', workout });
    } catch (error) {
        console.error('Error creating workout:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};


// Récupérer tous les entraînements d'un utilisateur
exports.getUserWorkouts = async (req, res) => {
    try {
        const { userId } = req.user;

        const workouts = await Workout.find({ createdBy: userId }).populate('exercises');
        res.status(200).json(workouts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.deleteWorkout = async (req, res) => {
    try {
        const { workoutId } = req.params;
        const { userId } = req.user;

        console.log('User ID:', userId);
        console.log('Workout ID:', workoutId);

        const workout = await Workout.findById(workoutId);
        if (!workout) {
            console.log('Workout not found');
            return res.status(404).json({ message: 'Workout not found' });
        }

        if (workout.createdBy.toString() !== userId) {
            console.log('User not authorized to delete this workout');
            return res.status(403).json({ message: 'You are not authorized to delete this workout' });
        }

        // Utilisez deleteOne ou findByIdAndDelete pour supprimer le document
        await Workout.findByIdAndDelete(workoutId);
        console.log('Workout deleted successfully');

        res.status(200).json({ message: 'Workout deleted successfully' });
    } catch (error) {
        console.error('Error deleting workout:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};



exports.updateWorkout = async (req, res) => {
    try {
        const { workoutId } = req.params;
        const { name, description, exercises } = req.body;
        const { userId } = req.user;

        // Vérifier que l'entraînement existe et appartient bien à l'utilisateur
        const workout = await Workout.findOne({ _id: workoutId, createdBy: userId });
        if (!workout) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        // Mettre à jour les informations de base de l'entraînement
        workout.name = name;
        workout.description = description;

        // Mettre à jour les exercices
        const updatedExercises = [];
        for (const exercise of exercises) {
            if (exercise._id) {
                // Si l'exercice existe déjà, on le met à jour
                const existingExercise = await Exercise.findById(exercise._id);
                if (existingExercise) {
                    existingExercise.set(exercise);
                    await existingExercise.save();
                    updatedExercises.push(existingExercise._id);
                }
            } else {
                // Si l'exercice est nouveau, on le crée
                const newExercise = new Exercise(exercise);
                await newExercise.save();
                updatedExercises.push(newExercise._id);
            }
        }

        // Associer les exercices mis à jour à l'entraînement
        workout.exercises = updatedExercises;

        // Sauvegarder l'entraînement
        await workout.save();

        res.status(200).json({ message: 'Workout updated successfully', workout });
    } catch (error) {
        console.error('Error updating workout:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};




// Récupérer le détail d'un entraînement spécifique
// exports.getWorkoutById = async (req, res) => {
//     try {
//         const { workoutId } = req.params;
//         const { userId } = req.user;

//         // Récupérer l'entraînement par ID et vérifier que l'utilisateur est bien le créateur
//         const workout = await Workout.findOne({ _id: workoutId, createdBy: userId }).populate('exercises');

//         if (!workout) {
//             return res.status(404).json({ message: 'Workout not found or not accessible' });
//         }

//         res.status(200).json(workout);
//     } catch (error) {
//         console.error('Error retrieving workout:', error);
//         res.status(500).json({ message: 'Server error', error });
//     }
// };
exports.getWorkoutById = async (req, res) => {
    try {
        const { workoutId } = req.params;
        const { userId } = req.user;

        // Récupérer l'entraînement par ID et vérifier que l'utilisateur est bien le créateur
        const workout = await Workout.findOne({ _id: workoutId, createdBy: userId })
            .populate({
                path: 'exercises', // Assurer que les exercices sont bien récupérés
                model: 'Exercise', // Modèle Exercise
            });

        if (!workout) {
            return res.status(404).json({ message: 'Workout not found or not accessible' });
        }

        res.status(200).json(workout);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'entraînement :', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// const WorkoutCoach = require('../models/workoutCoachModel');
// const ExerciceCoach = require('../models/exerciceCoachModel');
// const User = require('../models/userModel');

// // Créer un nouvel entraînement
// exports.createWorkoutCoach = async (req, res) => {
//     console.log('Received workout data:', req.body); // Log the request body

//     try {
//         const { name, clientId, exercises } = req.body;

//         // Check if exercises is defined and is an array
//         if (!Array.isArray(exercises)) {
//             console.error("Exercises is not an array:", exercises); // Add this for debugging
//             return res.status(400).json({ message: "Exercises must be an array." });
//         }

//         // Create exercises first
//         const exerciseDocs = await Promise.all(exercises.map(async (exerciseData) => {
//             const exercise = new ExerciceCoach(exerciseData);
//             await exercise.save();
//             return exercise._id;
//         }));

//         // Now create the workout
//         const workoutCoach = new WorkoutCoach({
//             name,
//             client: clientId,
//             exercises: exerciseDocs
//         });

//         await workoutCoach.save();
//         res.status(201).json(workoutCoach);
//     } catch (error) {
//         console.error('Error creating workout:', error); // Log the detailed error
//         res.status(500).json({ message: 'Erreur lors de la création de l\'entraînement', error });
//     }
// };

// // Ajouter un exercice à un entraînement existant
// exports.addExerciseToWorkout = async (req, res) => {
//     try {
//         const { workoutId } = req.params;
//         const exerciseData = req.body;

//         // Créer un nouvel exercice
//         const newExercise = new ExerciceCoach(exerciseData);
//         await newExercise.save();

//         // Ajouter l'exercice à l'entraînement
//         const updatedWorkout = await WorkoutCoach.findByIdAndUpdate(
//             workoutId,
//             { $push: { exercises: newExercise._id } },
//             { new: true }
//         ).populate({
//             path: 'exercises',
//             model: 'ExerciceCoach',
//             select: 'type name duration repetitions sets weight restTime notes'
//         });

//         if (!updatedWorkout) {
//             return res.status(404).json({ message: "Entraînement non trouvé" });
//         }

//         res.status(200).json(updatedWorkout);
//     } catch (error) {
//         console.error('Erreur lors de l\'ajout de l\'exercice:', error);
//         res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'exercice', error });
//     }
// };

// // Récupérer les détails d'un entraînement spécifique
// exports.getWorkoutById = async (req, res) => {
//     try {
//         const { workoutId } = req.params;

//         // Récupérer l'entraînement par ID avec les exercices peuplés
//         const workout = await WorkoutCoach.findById(workoutId)
//             .populate({
//                 path: 'exercises',
//                 model: 'ExerciceCoach',
//                 select: 'type name duration repetitions sets weight restTime notes'
//             });

//         if (!workout) {
//             return res.status(404).json({ message: "Entraînement non trouvé" });
//         }

//         res.status(200).json(workout);
//     } catch (error) {
//         console.error('Erreur lors de la récupération de l\'entraînement:', error);
//         res.status(500).json({ message: 'Erreur lors de la récupération de l\'entraînement', error });
//     }
// };


// // Récupérer les entraînements d'un client
// exports.getWorkoutsByClient = async (req, res) => {
//     try {
//         const { clientId } = req.params;

//         // Récupérer les entraînements pour un client, avec les détails des exercices peuplés
//         const workouts = await WorkoutCoach.find({ client: clientId })
//             .populate({
//                 path: 'exercises',
//                 model: 'ExerciceCoach',  // Modèle utilisé pour les exercices
//                 select: 'type name duration repetitions sets weight restTime notes' // Champs que vous souhaitez retourner
//             })
//             .populate({
//                 path: 'client',
//                 model: 'User',
//                 select: 'firstName lastName email' // Champs que vous souhaitez retourner pour le client
//             });

//         // Envoyer la réponse avec les entraînements peuplés
//         res.status(200).json(workouts);
//     } catch (error) {
//         console.error('Erreur lors de la récupération des entraînements:', error);
//         res.status(500).json({ message: 'Erreur lors de la récupération des entraînements', error });
//     }
// };


// // Supprimer un entraînement
// exports.deleteWorkoutCoach = async (req, res) => {
//     try {
//         const { workoutId } = req.params;
//         await WorkoutCoach.findByIdAndDelete(workoutId);
//         res.status(200).json({ message: 'Entraînement supprimé avec succès' });
//     } catch (error) {
//         res.status(500).json({ message: 'Erreur lors de la suppression de l\'entraînement', error });
//     }
// };


// // Mettre à jour un entraînement existant
// exports.updateWorkoutCoach = async (req, res) => {
//     try {
//         const { workoutId } = req.params;
//         const updatedData = req.body;

//         // Mettre à jour l'entraînement avec les nouvelles données
//         const updatedWorkout = await WorkoutCoach.findByIdAndUpdate(
//             workoutId,
//             updatedData,
//             { new: true }
//         ).populate({
//             path: 'exercises',
//             model: 'ExerciceCoach',
//             select: 'type name duration repetitions sets weight restTime notes'
//         });

//         if (!updatedWorkout) {
//             return res.status(404).json({ message: "Entraînement non trouvé" });
//         }

//         res.status(200).json(updatedWorkout);
//     } catch (error) {
//         console.error('Erreur lors de la mise à jour de l\'entraînement:', error);
//         res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'entraînement', error });
//     }
// };

// // Supprimer un exercice d'un entraînement existant
// exports.deleteExerciseFromWorkout = async (req, res) => {
//     try {
//         const { workoutId, exerciseId } = req.params;

//         // Supprimer l'exercice de l'entraînement
//         const updatedWorkout = await WorkoutCoach.findByIdAndUpdate(
//             workoutId,
//             { $pull: { exercises: exerciseId } },
//             { new: true }
//         ).populate({
//             path: 'exercises',
//             model: 'ExerciceCoach',
//             select: 'type name duration repetitions sets weight restTime notes'
//         });

//         if (!updatedWorkout) {
//             return res.status(404).json({ message: "Entraînement non trouvé" });
//         }

//         // Supprimer l'exercice de la collection ExerciceCoach
//         await ExerciceCoach.findByIdAndDelete(exerciseId);

//         res.status(200).json(updatedWorkout);
//     } catch (error) {
//         console.error('Erreur lors de la suppression de l\'exercice:', error);
//         res.status(500).json({ message: 'Erreur lors de la suppression de l\'exercice', error });
//     }
// };

const WorkoutCoach = require('../models/workoutCoachModel');
const ExerciceCoach = require('../models/exerciceCoachModel');
const User = require('../models/userModel');

// Créer un nouvel entraînement
exports.createWorkoutCoach = async (req, res) => {
    console.log('Received workout data:', req.body);

    try {
        const { name, clientId, exercises } = req.body;

        if (!Array.isArray(exercises)) {
            console.error("Exercises is not an array:", exercises);
            return res.status(400).json({ message: "Exercises must be an array." });
        }

        // Créer les exercices avec gestion de la durée (minutes et secondes)
        const exerciseDocs = await Promise.all(exercises.map(async (exerciseData) => {
            const { durationMinutes, durationSeconds } = exerciseData;
            const totalDurationInSeconds = (durationMinutes * 60) + durationSeconds;

            const newExercise = new ExerciceCoach({
                name: exerciseData.name,
                description: exerciseData.description,
                type: exerciseData.type,
                targetMuscles: exerciseData.targetMuscles,
                equipment: exerciseData.equipment,
                difficultyLevel: exerciseData.difficultyLevel,
                duration: totalDurationInSeconds, // Stocker la durée en secondes
                repetitions: exerciseData.repetitions,
                sets: exerciseData.sets,
                restTime: exerciseData.restTime,
                goal: exerciseData.goal,
                progressionMode: exerciseData.progressionMode,
                resourceLink: exerciseData.resourceLink
            });

            await newExercise.save();
            return newExercise._id;
        }));

        const workoutCoach = new WorkoutCoach({
            name,
            client: clientId,
            exercises: exerciseDocs
        });

        await workoutCoach.save();
        res.status(201).json(workoutCoach);
    } catch (error) {
        console.error('Error creating workout:', error);
        res.status(500).json({ message: 'Erreur lors de la création de l\'entraînement', error });
    }
};



// Ajouter un exercice à un entraînement existant
exports.addExerciseToWorkout = async (req, res) => {
    try {
        const { workoutId } = req.params;
        const exerciseData = req.body;

        console.log("Données reçues pour l'ajout de l'exercice:", exerciseData);

        const newExercise = new ExerciceCoach({
            name: exerciseData.name,
            description: exerciseData.description,
            type: exerciseData.type,
            targetMuscles: exerciseData.targetMuscles,
            equipment: exerciseData.equipment,
            difficultyLevel: exerciseData.difficultyLevel,
            duration: exerciseData.duration, // Assurez-vous que c'est bien en secondes
            repetitions: exerciseData.repetitions,
            sets: exerciseData.sets,
            restTime: exerciseData.restTime, // Assurez-vous que c'est bien en secondes
            goal: exerciseData.goal,
            progressionMode: exerciseData.progressionMode,
            resourceLink: exerciseData.resourceLink
        });

        await newExercise.save();

        const updatedWorkout = await WorkoutCoach.findByIdAndUpdate(
            workoutId,
            { $push: { exercises: newExercise._id } },
            { new: true }
        ).populate({
            path: 'exercises',
            model: 'ExerciceCoach',
            select: 'type name duration repetitions sets weight restTime notes description targetMuscles equipment difficultyLevel goal progressionMode resourceLink'
        });

        if (!updatedWorkout) {
            return res.status(404).json({ message: "Entraînement non trouvé" });
        }

        res.status(200).json(updatedWorkout);
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'exercice:', error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'exercice', error });
    }
};

// Récupérer les détails d'un entraînement spécifique
exports.getWorkoutById = async (req, res) => {
    try {
        const { workoutId } = req.params;

        // Récupérer l'entraînement par ID avec les exercices peuplés
        const workout = await WorkoutCoach.findById(workoutId)
            .populate({
                path: 'exercises',
                model: 'ExerciceCoach',
                select: 'type name duration repetitions sets weight restTime notes description targetMuscles equipment difficultyLevel goal progressionMode resourceLink'
            });

        if (!workout) {
            return res.status(404).json({ message: "Entraînement non trouvé" });
        }

        res.status(200).json(workout);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'entraînement:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'entraînement', error });
    }
};

// Récupérer les entraînements d'un client
exports.getWorkoutsByClient = async (req, res) => {
    try {
        const { clientId } = req.params;

        // Récupérer les entraînements pour un client, avec les détails des exercices peuplés
        const workouts = await WorkoutCoach.find({ client: clientId })
            .populate({
                path: 'exercises',
                model: 'ExerciceCoach',
                select: 'type name duration repetitions sets weight restTime notes description targetMuscles equipment difficultyLevel goal progressionMode resourceLink'
            })
            .populate({
                path: 'client',
                model: 'User',
                select: 'firstName lastName email'
            });

        res.status(200).json(workouts);
    } catch (error) {
        console.error('Erreur lors de la récupération des entraînements:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des entraînements', error });
    }
};

// Supprimer un entraînement
exports.deleteWorkoutCoach = async (req, res) => {
    try {
        const { workoutId } = req.params;
        await WorkoutCoach.findByIdAndDelete(workoutId);
        res.status(200).json({ message: 'Entraînement supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'entraînement', error });
    }
};

// Mettre à jour un entraînement existant
exports.updateWorkoutCoach = async (req, res) => {
    try {
        const { workoutId } = req.params;
        const { name, exercises } = req.body;

        // Vérifier que l'entraînement existe
        const workout = await WorkoutCoach.findById(workoutId);
        if (!workout) {
            return res.status(404).json({ message: "Entraînement non trouvé" });
        }

        // Mettre à jour les exercices
        const updatedExercises = [];
        for (const exerciseData of exercises) {
            if (exerciseData._id) {
                // Si l'exercice existe déjà, on le met à jour
                const existingExercise = await ExerciceCoach.findById(exerciseData._id);
                if (existingExercise) {
                    existingExercise.set(exerciseData);
                    await existingExercise.save();
                    updatedExercises.push(existingExercise._id);
                }
            } else {
                // Si l'exercice est nouveau, on le crée
                let newExercise;
                if (exerciseData.type === 'cardio') {
                    newExercise = new ExerciceCoach({
                        type: 'cardio',
                        cardio: {
                            name: exerciseData.name,
                            duration: exerciseData.duration,
                            repetitions: exerciseData.repetitions,
                            repetitionTime: exerciseData.repetitionTime,
                            restTime: exerciseData.restTime,
                        }
                    });
                } else if (exerciseData.type === 'physical') {
                    newExercise = new ExerciceCoach({
                        type: 'physical',
                        physical: {
                            name: exerciseData.name,
                            duration: exerciseData.duration,
                            repetitions: exerciseData.repetitions,
                            sets: exerciseData.sets,
                            weight: exerciseData.weight,
                            restTime: exerciseData.restTime,
                        }
                    });
                } else if (exerciseData.type === 'étirement' || exerciseData.type === 'mobilité') {
                    newExercise = new ExerciceCoach({
                        type: exerciseData.type,
                        duration: exerciseData.duration,
                        repetitions: exerciseData.repetitions,
                        restTime: exerciseData.restTime,
                    });
                }

                await newExercise.save();
                updatedExercises.push(newExercise._id);
            }
        }

        // Mettre à jour les informations de l'entraînement
        workout.name = name;
        workout.exercises = updatedExercises;

        // Sauvegarder l'entraînement
        await workout.save();

        res.status(200).json({ message: "Workout updated successfully", workout });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'entraînement:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'entraînement', error });
    }
};

// Supprimer un exercice d'un entraînement existant
exports.deleteExerciseFromWorkout = async (req, res) => {
    try {
        const { workoutId, exerciseId } = req.params;

        // Supprimer l'exercice de l'entraînement
        const updatedWorkout = await WorkoutCoach.findByIdAndUpdate(
            workoutId,
            { $pull: { exercises: exerciseId } },
            { new: true }
        ).populate({
            path: 'exercises',
            model: 'ExerciceCoach',
            select: 'type name duration repetitions sets weight restTime notes description targetMuscles equipment difficultyLevel goal progressionMode resourceLink'
        });

        if (!updatedWorkout) {
            return res.status(404).json({ message: "Entraînement non trouvé" });
        }

        // Supprimer l'exercice de la collection ExerciceCoach
        await ExerciceCoach.findByIdAndDelete(exerciseId);

        res.status(200).json(updatedWorkout);
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'exercice:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'exercice', error });
    }
};

import { api } from "../lib/api";

export interface Train {
  id: string;
  title: string;
  type: string;
  duration: number;
  is_public: boolean;
  difficulty: string;
  calories: number;
  category_id: string;
  image_url: string;
  created_by: string;
  created_at: string;
}

// Поля, которые задаёт админ при создании.
// id / created_by / created_at проставляет бэкенд.
export interface CreateTrainInput {
  title: string;
  type: string;
  difficulty: string;
  duration: number;
  calories: number;
  is_public: boolean;
  category_id: string;
}
export interface TrainCategory {
  id: string;
  title: string;
  updated_at: string;
  created_at: string;
  version: number;
}

// Упражнение в составе тренировки — своя форма (с count'ами и порядком),
// отличается от самостоятельного Exercise.
export interface TrainExercise {
  exercise_id: string;
  exercise_title: string;
  description: string;
  video_url: string;
  difficulty: string;
  steps: number;
  sets: number;
  position: number;
}

export interface TrainWithExercises {
  train: Train;
  exercises: TrainExercise[];
}

// Добавление существующего упражнения в тренировку с подходами/повторами и порядком.
export interface AddExerciseToTrainInput {
  exercise_id: string;
  sets: number;
  steps: number;
  position: number;
}
export const TrainService = {
  async getAllTrains(): Promise<Train[]> {
    const { data } = await api.get<Train[]>("/train");
    return data;
  },

  async createTrain(input: CreateTrainInput): Promise<Train> {
    const { data } = await api.post<Train>("/train", input);
    return data;
  },

  async uploadTrainImage(id: string, image: File): Promise<void> {
    const formData = new FormData();
    formData.append("image", image);
    await api.post(`/train/${id}/image`, formData);
  },

  async deleteTrain(id: string): Promise<void> {
    await api.delete(`/train/${id}`);
  },
  async getAllTrainCategory(): Promise<TrainCategory[]> {
    const { data } = await api.get<TrainCategory[]>("/train/category");
    return data;
  },
  async getTrainAndExercises(id: string): Promise<TrainWithExercises> {
    const { data } = await api.get<TrainWithExercises>(
      `/train/${id}/exercises`,
    );
    return data;
  },

  async addExerciseToTrain(
    trainId: string,
    input: AddExerciseToTrainInput,
  ): Promise<void> {
    await api.post(`/train/${trainId}/exercises`, { exercises: [input] });
  },

  async removeExerciseFromTrain(
    trainId: string,
    exerciseId: string,
  ): Promise<void> {
    await api.delete(`/train/${trainId}/exercises/${exerciseId}`);
  },
};

import { api } from "../lib/api";

export interface Exercise {
  id: string;
  title: string;
  description: string;
  video_url: string;
}

// Поля, которые задаёт админ при создании. id проставляет бэкенд,
// video_url появляется после загрузки видео вторым запросом.
export interface CreateExerciseInput {
  title: string;
  description: string;
}

export const ExerciseService = {
  async getAllExercises(): Promise<Exercise[]> {
    const { data } = await api.get<Exercise[]>("/exercises");
    return data;
  },

  async createExercise(input: CreateExerciseInput): Promise<Exercise> {
    const { data } = await api.post<Exercise>("/exercises", input);
    return data;
  },

  async uploadExerciseVideo(id: string, video: File): Promise<void> {
    const formData = new FormData();
    formData.append("video", video);
    await api.post(`/exercises/${id}/video`, formData);
  },

  async deleteExercise(id: string): Promise<void> {
    await api.delete(`/exercises/${id}`);
  },
};

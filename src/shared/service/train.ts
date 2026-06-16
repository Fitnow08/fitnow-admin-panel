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
// Параметры курсорной пагинации (snake_case — как у Go-бэкенда).
// Пустые значения не отправляются.
export interface GetTrainsParams {
  cursor?: string;
  limit?: number;
  category_id?: string;
  text?: string;
}

// Ответ списка тренировок — 1:1 с catalog AllTrainsResult.
export interface TrainsPage {
  trains: Train[];
  next_cursor: string;
  has_more: boolean;
}

export const TrainService = {
  // Курсорная (keyset) пагинация. cursor === "" — первая страница.
  async getTrains(params: GetTrainsParams = {}): Promise<TrainsPage> {
    const { data } = await api.get<TrainsPage | Train[]>("/train", {
      params: {
        cursor: params.cursor || undefined,
        limit: params.limit,
        category_id: params.category_id || undefined,
        text: params.text || undefined,
      },
    });
    // Пока gateway не отдаёт курсор, он возвращает голый массив —
    // нормализуем к TrainsPage, чтобы фронт работал в обоих случаях.
    if (Array.isArray(data)) {
      return { trains: data, next_cursor: "", has_more: false };
    }
    return data;
  },

  // Совместимая обёртка для мест, где нужен просто список (дашборд, селекты).
  // Берёт первую страницу; при необходимости подними limit.
  async getAllTrains(): Promise<Train[]> {
    const { trains } = await TrainService.getTrains({ limit: 100 });
    return trains;
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

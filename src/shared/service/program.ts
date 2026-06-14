import { api } from "../lib/api";
import type { Train } from "./train";

export type Difficulty = "easy" | "medium" | "hard";

export interface Program {
  id: string;
  title: string;
  weeks: number;
  difficulty: Difficulty;
  is_public: boolean;
  category_id: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  version: number;
  trains_count: number;
}

// Поля, которые задаёт админ при создании.
// id / created_by / created_at проставляет бэкенд.
export interface CreateProgramInput {
  title: string;
  type: string;
  difficulty: string;
  duration: number;
  calories: number;
  is_public: boolean;
  category_id: string;
}

export interface ProgramCategory {
  id: string;
  title: string;
  updated_at: string;
  created_at: string;
  version: number;
}

// Тренировка в составе программы — Train плюс расположение в расписании.
export interface ProgramTrain extends Train {
  week_number: number;
  day_of_week: number;
  position: number;
}

export interface ProgramWithTrains {
  program: Program;
  trains: ProgramTrain[];
}

// Добавление существующей тренировки в программу с расположением в расписании.
export interface AddTrainToProgramInput {
  train_id: string;
  week_number: number;
  day_of_week: number;
  position: number;
}

export const ProgramService = {
  async getAllPrograms(): Promise<Program[]> {
    const { data } = await api.get<Program[]>("/program");
    return data;
  },

  async createProgram(input: CreateProgramInput): Promise<Program> {
    const { data } = await api.post<Program>("/program", input);
    return data;
  },

  async uploadProgramImage(id: string, image: File): Promise<void> {
    const formData = new FormData();
    formData.append("image", image);
    await api.post(`/program/${id}/image`, formData);
  },

  async deleteProgram(id: string): Promise<void> {
    await api.delete(`/program/${id}`);
  },

  async getAllProgramCategory(): Promise<ProgramCategory[]> {
    const { data } = await api.get<ProgramCategory[]>("/program/category");
    return data;
  },

  async getProgramAndTrains(id: string): Promise<ProgramWithTrains> {
    const { data } = await api.get<ProgramWithTrains>(`/program/${id}/trains`);
    return data;
  },

  async addTrainToProgram(
    programId: string,
    input: AddTrainToProgramInput,
  ): Promise<void> {
    await api.post(`/program/${programId}/trains`, { trains: [input] });
  },

  async removeTrainFromProgram(
    programId: string,
    trainId: string,
  ): Promise<void> {
    await api.delete(`/program/${programId}/trains/${trainId}`);
  },
};

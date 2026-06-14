import { api } from "../lib/api";
export interface User {
  id: string;
  title: string;
  email: string;
  role: string;
  createdAt: string;
}
export const UserService = {
  async getAllUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>("/user/all");
    return data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/user/${id}`);
  },
};

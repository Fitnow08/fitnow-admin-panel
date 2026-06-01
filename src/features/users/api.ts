import { api } from '@/lib/api'

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

// Подгони путь и форму ответа под свой бэкенд fitnow
export async function fetchUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users')
  return data
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`)
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/features/auth/AuthContext";
import { ThemeProvider } from "@/features/theme/ThemeContext";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { AdminLayout } from "@/layout/AdminLayout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { UsersPage } from "@/pages/UsersPage";
import { WorkoutsPage } from "@/pages/WorkoutsPage";
import { CreateWorkoutPage } from "@/pages/CreateWorkoutPage";
import { WorkoutDetailPage } from "@/pages/WorkoutDetailPage";
import { ProgramsPage } from "@/pages/ProgramsPage";
import { CreateProgramPage } from "@/pages/CreateProgramPage";
import { ProgramDetailPage } from "@/pages/ProgramDetailPage";
import { ExercisesPage } from "@/pages/ExercisesPage";
import { CreateExercisePage } from "@/pages/CreateExercisePage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="workouts" element={<WorkoutsPage />} />
                  <Route path="workouts/new" element={<CreateWorkoutPage />} />
                  <Route path="workouts/:id" element={<WorkoutDetailPage />} />
                  <Route path="programs" element={<ProgramsPage />} />
                  <Route path="programs/new" element={<CreateProgramPage />} />
                  <Route path="programs/:id" element={<ProgramDetailPage />} />
                  <Route path="exercises" element={<ExercisesPage />} />
                  <Route
                    path="exercises/new"
                    element={<CreateExercisePage />}
                  />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

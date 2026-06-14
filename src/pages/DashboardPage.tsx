import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ClipboardList, Dumbbell, ListChecks, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserService } from "@/shared/service/user";
import { TrainService } from "@/shared/service/train";
import { ExerciseService } from "@/shared/service/exercise";
import { ProgramService } from "@/shared/service/program";

export function DashboardPage() {
  const users = useQuery({
    queryKey: ["users"],
    queryFn: UserService.getAllUsers,
  });
  const trains = useQuery({
    queryKey: ["trains"],
    queryFn: TrainService.getAllTrains,
  });
  const exercises = useQuery({
    queryKey: ["exercises"],
    queryFn: ExerciseService.getAllExercises,
  });
  const programs = useQuery({
    queryKey: ["programs"],
    queryFn: ProgramService.getAllPrograms,
  });

  const stats = [
    {
      label: "Пользователей",
      to: "/users",
      icon: Users,
      count: users.data?.length,
      isLoading: users.isLoading,
      isError: users.isError,
    },
    {
      label: "Тренировок",
      to: "/workouts",
      icon: Dumbbell,
      count: trains.data?.length,
      isLoading: trains.isLoading,
      isError: trains.isError,
    },
    {
      label: "Программ",
      to: "/programs",
      icon: ClipboardList,
      count: programs.data?.length,
      isLoading: programs.isLoading,
      isError: programs.isError,
    },
    {
      label: "Упражнений",
      to: "/exercises",
      icon: ListChecks,
      count: exercises.data?.length,
      isLoading: exercises.isLoading,
      isError: exercises.isError,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Дашборд</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  to,
  icon: Icon,
  count,
  isLoading,
  isError,
}: {
  label: string;
  to: string;
  icon: LucideIcon;
  count: number | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <Link to={to} className="block">
      <Card className="transition-colors hover:bg-accent">
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <Icon className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className="text-2xl font-bold text-destructive">—</div>
          ) : isLoading ? (
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
          ) : (
            <div className="text-3xl font-bold tabular-nums">
              {count?.toLocaleString("ru-RU")}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

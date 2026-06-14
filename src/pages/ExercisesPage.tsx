import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ExerciseService } from "@/shared/service/exercise";

export function ExercisesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["exercises"],
    queryFn: ExerciseService.getAllExercises,
  });

  const remove = useMutation({
    mutationFn: ExerciseService.deleteExercise,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exercises"] }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Упражнения</h1>
        <Button onClick={() => navigate("/exercises/new")}>
          <Plus className="size-4" />
          Создать
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          {isLoading && <p className="text-muted-foreground">Загрузка…</p>}
          {isError && (
            <p className="text-destructive">Не удалось загрузить упражнения</p>
          )}
          {data && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Видео</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((exercise) => (
                  <TableRow key={exercise.id}>
                    <TableCell className="font-medium">
                      {exercise.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {exercise.description}
                    </TableCell>
                    <TableCell>
                      {exercise.video_url ? (
                        <a
                          href={exercise.video_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          Открыть
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove.mutate(exercise.id)}
                        disabled={remove.isPending}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

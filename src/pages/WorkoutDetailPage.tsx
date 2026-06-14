import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { TrainService } from "@/shared/service/train";
import { ExerciseService } from "@/shared/service/exercise";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/shared/lib/utils";

const selectClass =
  "flex h-9 w-full rounded-md border bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background [&>option]:text-foreground";

export function WorkoutDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const [adding, setAdding] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["train", id],
    queryFn: () => TrainService.getTrainAndExercises(id!),
    enabled: !!id,
  });

  const removeExercise = useMutation({
    mutationFn: (exerciseId: string) =>
      TrainService.removeExerciseFromTrain(id!, exerciseId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["train", id] }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/workouts")}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {data ? data.train.title : "Тренировка"}
        </h1>
      </div>

      {isLoading && <p className="text-muted-foreground">Загрузка…</p>}
      {isError && (
        <p className="text-destructive">Не удалось загрузить тренировку</p>
      )}

      {data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Параметры</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 sm:flex-row">
              {data.train.image_url && (
                <img
                  src={data.train.image_url}
                  alt={data.train.title}
                  className="h-40 w-full rounded-md border object-cover sm:w-64"
                />
              )}
              <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3">
                <Info label="Тип" value={data.train.type} />
                <Info label="Сложность" value={data.train.difficulty} />
                <Info
                  label="Длительность"
                  value={`${data.train.duration} мин`}
                />
                <Info label="Калории" value={`${data.train.calories} ккал`} />
                <Info
                  label="Доступ"
                  value={data.train.is_public ? "Публичная" : "Приватная"}
                />
                <Info
                  label="Создана"
                  value={new Date(data.train.created_at).toLocaleDateString(
                    "ru-RU",
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Упражнения</CardTitle>
              <Button
                variant={adding ? "ghost" : "default"}
                size="sm"
                onClick={() => setAdding((v) => !v)}
              >
                {adding ? (
                  <>
                    <X className="size-4" />
                    Отмена
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    Добавить
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {adding && (
                <AddExerciseForm
                  trainId={id!}
                  existingIds={data.exercises.map((e) => e.exercise_id)}
                  onDone={() => setAdding(false)}
                />
              )}

              {data.exercises.length === 0 ? (
                <p className="text-muted-foreground">
                  В тренировке пока нет упражнений
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead>Описание</TableHead>
                      <TableHead>Подходы</TableHead>
                      <TableHead>Повторы</TableHead>
                      <TableHead>Видео</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.exercises
                      .slice()
                      .sort((a, b) => a.position - b.position)
                      .map((exercise) => (
                        <TableRow key={exercise.exercise_id}>
                          <TableCell>{exercise.position}</TableCell>
                          <TableCell className="font-medium">
                            {exercise.exercise_title}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {exercise.description}
                          </TableCell>
                          <TableCell>{exercise.sets}</TableCell>
                          <TableCell>{exercise.steps}</TableCell>
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
                              onClick={() =>
                                removeExercise.mutate(exercise.exercise_id)
                              }
                              disabled={removeExercise.isPending}
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
        </>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

const addSchema = z.object({
  exercise_id: z.string().min(1, { error: "Выберите упражнение" }),
  sets: z
    .number({ error: "Введите число" })
    .int()
    .positive({ error: "Должно быть больше 0" }),
  steps: z
    .number({ error: "Введите число" })
    .int()
    .positive({ error: "Должно быть больше 0" }),
  position: z
    .number({ error: "Введите число" })
    .int()
    .positive({ error: "Должно быть больше 0" }),
});

type AddValues = z.infer<typeof addSchema>;

function AddExerciseForm({
  trainId,
  existingIds,
  onDone,
}: {
  trainId: string;
  existingIds: string[];
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");

  const { data: exercises } = useQuery({
    queryKey: ["exercises"],
    queryFn: ExerciseService.getAllExercises,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddValues>({
    resolver: zodResolver(addSchema),
    defaultValues: { sets: 1, steps: 1, position: 1 },
  });

  const add = useMutation({
    mutationFn: (values: AddValues) =>
      TrainService.addExerciseToTrain(trainId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["train", trainId] });
      onDone();
    },
    onError: (error) => {
      setServerError(
        isAxiosError(error)
          ? "Не удалось добавить упражнение"
          : "Неизвестная ошибка",
      );
    },
  });

  // Не предлагаем упражнения, которые уже есть в тренировке.
  const available = exercises?.filter((e) => !existingIds.includes(e.id));

  function onSubmit(values: AddValues) {
    setServerError("");
    add.mutate(values);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded-md border p-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="exercise_id">Упражнение</Label>
        <select
          id="exercise_id"
          className={cn(selectClass)}
          defaultValue=""
          {...register("exercise_id")}
        >
          <option value="" disabled>
            Выберите упражнение
          </option>
          {available?.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.title}
            </option>
          ))}
        </select>
        {errors.exercise_id && (
          <p className="text-sm text-destructive">
            {errors.exercise_id.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="sets">Подходы</Label>
          <Input
            id="sets"
            type="number"
            {...register("sets", { valueAsNumber: true })}
          />
          {errors.sets && (
            <p className="text-sm text-destructive">{errors.sets.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="steps">Повторы</Label>
          <Input
            id="steps"
            type="number"
            {...register("steps", { valueAsNumber: true })}
          />
          {errors.steps && (
            <p className="text-sm text-destructive">{errors.steps.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="position">Порядок</Label>
          <Input
            id="position"
            type="number"
            {...register("position", { valueAsNumber: true })}
          />
          {errors.position && (
            <p className="text-sm text-destructive">
              {errors.position.message}
            </p>
          )}
        </div>
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" size="sm" disabled={add.isPending}>
          {add.isPending ? "Добавление…" : "Добавить в тренировку"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Отмена
        </Button>
      </div>
    </form>
  );
}

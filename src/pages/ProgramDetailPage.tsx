import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { ProgramService } from "@/shared/service/program";
import { TrainService } from "@/shared/service/train";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/lib/utils";

const WEEKDAYS = ["", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const selectClass =
  "flex h-9 w-full rounded-md border bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background [&>option]:text-foreground";

export function ProgramDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const [adding, setAdding] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["program", id],
    queryFn: () => ProgramService.getProgramAndTrains(id!),
    enabled: !!id,
  });

  const removeTrain = useMutation({
    mutationFn: (trainId: string) =>
      ProgramService.removeTrainFromProgram(id!, trainId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["program", id] }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/programs")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {data ? data.program.title : "Программа"}
        </h1>
      </div>

      {isLoading && <p className="text-muted-foreground">Загрузка…</p>}
      {isError && (
        <p className="text-destructive">Не удалось загрузить программу</p>
      )}

      {data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Параметры</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 sm:flex-row">
              {data.program.image_url && (
                <img
                  src={data.program.image_url}
                  alt={data.program.title}
                  className="h-40 w-full rounded-md border object-cover sm:w-64"
                />
              )}
              <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3">
                <Info label="Сложность" value={data.program.difficulty} />
                <Info label="Недель" value={String(data.program.weeks)} />
                <Info label="Тренировок" value={String(data.trains.length)} />
                <Info
                  label="Доступ"
                  value={data.program.is_public ? "Публичная" : "Приватная"}
                />
                <Info
                  label="Создана"
                  value={new Date(data.program.created_at).toLocaleDateString(
                    "ru-RU",
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Тренировки</CardTitle>
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
                <AddTrainForm
                  programId={id!}
                  existingIds={data.trains.map((t) => t.id)}
                  onDone={() => setAdding(false)}
                />
              )}

              {data.trains.length === 0 ? (
                <p className="text-muted-foreground">
                  В программе пока нет тренировок
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16" />
                      <TableHead>Неделя</TableHead>
                      <TableHead>День</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Сложность</TableHead>
                      <TableHead>Длительность</TableHead>
                      <TableHead>Калории</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.trains
                      .slice()
                      .sort(
                        (a, b) =>
                          a.week_number - b.week_number ||
                          a.day_of_week - b.day_of_week ||
                          a.position - b.position,
                      )
                      .map((train) => (
                        <TableRow
                          key={train.id}
                          onClick={() => navigate(`/workouts/${train.id}`)}
                          className="cursor-pointer"
                        >
                          <TableCell>
                            {train.image_url && (
                              <img
                                src={train.image_url}
                                alt={train.title}
                                className="h-10 w-14 rounded border object-cover"
                              />
                            )}
                          </TableCell>
                          <TableCell>{train.week_number}</TableCell>
                          <TableCell>
                            {WEEKDAYS[train.day_of_week] ?? train.day_of_week}
                          </TableCell>
                          <TableCell className="font-medium">
                            {train.title}
                          </TableCell>
                          <TableCell>{train.type}</TableCell>
                          <TableCell>{train.difficulty}</TableCell>
                          <TableCell>{train.duration} мин</TableCell>
                          <TableCell>{train.calories} ккал</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTrain.mutate(train.id);
                              }}
                              disabled={removeTrain.isPending}
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
  train_id: z.string().min(1, { error: "Выберите тренировку" }),
  week_number: z
    .number({ error: "Введите число" })
    .int()
    .positive({ error: "Должно быть больше 0" }),
  day_of_week: z.number().int().min(1).max(7),
  position: z
    .number({ error: "Введите число" })
    .int()
    .positive({ error: "Должно быть больше 0" }),
});

type AddValues = z.infer<typeof addSchema>;

function AddTrainForm({
  programId,
  existingIds,
  onDone,
}: {
  programId: string;
  existingIds: string[];
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");

  const { data: trains } = useQuery({
    queryKey: ["trains"],
    queryFn: TrainService.getAllTrains,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddValues>({
    resolver: zodResolver(addSchema),
    defaultValues: { week_number: 1, day_of_week: 1, position: 1 },
  });

  const add = useMutation({
    mutationFn: (values: AddValues) =>
      ProgramService.addTrainToProgram(programId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program", programId] });
      onDone();
    },
    onError: (error) => {
      setServerError(
        isAxiosError(error)
          ? "Не удалось добавить тренировку"
          : "Неизвестная ошибка",
      );
    },
  });

  // Не предлагаем тренировки, которые уже есть в программе.
  const available = trains?.filter((t) => !existingIds.includes(t.id));

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
        <Label htmlFor="train_id">Тренировка</Label>
        <select
          id="train_id"
          className={cn(selectClass)}
          defaultValue=""
          {...register("train_id")}
        >
          <option value="" disabled>
            Выберите тренировку
          </option>
          {available?.map((train) => (
            <option key={train.id} value={train.id}>
              {train.title}
            </option>
          ))}
        </select>
        {errors.train_id && (
          <p className="text-sm text-destructive">{errors.train_id.message}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="week_number">Неделя</Label>
          <Input
            id="week_number"
            type="number"
            {...register("week_number", { valueAsNumber: true })}
          />
          {errors.week_number && (
            <p className="text-sm text-destructive">
              {errors.week_number.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="day_of_week">День недели</Label>
          <select
            id="day_of_week"
            className={cn(selectClass)}
            {...register("day_of_week", { valueAsNumber: true })}
          >
            {WEEKDAYS.slice(1).map((day, i) => (
              <option key={day} value={i + 1}>
                {day}
              </option>
            ))}
          </select>
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
          {add.isPending ? "Добавление…" : "Добавить в программу"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Отмена
        </Button>
      </div>
    </form>
  );
}

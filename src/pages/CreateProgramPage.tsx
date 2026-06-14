import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { ArrowLeft } from "lucide-react";
import { ProgramService } from "@/shared/service/program";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/shared/lib/utils";

const selectClass =
  "flex h-9 w-full rounded-md border bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-background [&>option]:text-foreground";

const schema = z.object({
  title: z.string().min(1, { error: "Введите название" }),
  type: z.enum(["strength", "cardio"], { error: "Выберите тип" }),
  difficulty: z.enum(["easy", "medium", "hard"], {
    error: "Выберите сложность",
  }),
  duration: z
    .number({ error: "Введите число" })
    .int()
    .positive({ error: "Должно быть больше 0" }),
  calories: z
    .number({ error: "Введите число" })
    .int()
    .nonnegative({ error: "Не может быть отрицательным" }),
  category_id: z.string().min(1, { error: "Введите категорию" }),
  image: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, { error: "Загрузите изображение" })
    .refine((files) => files[0]?.type.startsWith("image/"), {
      error: "Файл должен быть изображением",
    }),
  is_public: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function CreateProgramPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["program-categories"],
    queryFn: ProgramService.getAllProgramCategory,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "strength", difficulty: "easy", is_public: true },
  });

  const create = useMutation({
    mutationFn: async (values: FormValues) => {
      // 1. создаём программу и получаем её id
      const program = await ProgramService.createProgram({
        title: values.title,
        type: values.type,
        difficulty: values.difficulty,
        duration: values.duration,
        calories: values.calories,
        is_public: values.is_public,
        category_id: values.category_id,
      });
      // 2. загружаем изображение на полученный id
      await ProgramService.uploadProgramImage(program.id, values.image[0]);
      return program;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      navigate("/programs");
    },
    onError: (error) => {
      setServerError(
        isAxiosError(error)
          ? "Не удалось создать программу"
          : "Неизвестная ошибка",
      );
    },
  });

  function onSubmit(values: FormValues) {
    setServerError("");
    create.mutate(values);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/programs")}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-bold">Новая программа</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Параметры программы</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Название</Label>
              <Input id="title" {...register("title")} />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="type">Тип</Label>
                <select
                  id="type"
                  className={cn(selectClass)}
                  {...register("type")}
                >
                  <option value="strength">Силовая</option>
                  <option value="cardio">Кардио</option>
                </select>
                {errors.type && (
                  <p className="text-sm text-destructive">
                    {errors.type.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="difficulty">Сложность</Label>
                <select
                  id="difficulty"
                  className={cn(selectClass)}
                  {...register("difficulty")}
                >
                  <option value="easy">Лёгкая</option>
                  <option value="medium">Средняя</option>
                  <option value="hard">Тяжёлая</option>
                </select>
                {errors.difficulty && (
                  <p className="text-sm text-destructive">
                    {errors.difficulty.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="duration">Длительность (мин)</Label>
                <Input
                  id="duration"
                  type="number"
                  {...register("duration", { valueAsNumber: true })}
                />
                {errors.duration && (
                  <p className="text-sm text-destructive">
                    {errors.duration.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="calories">Калории (ккал)</Label>
                <Input
                  id="calories"
                  type="number"
                  {...register("calories", { valueAsNumber: true })}
                />
                {errors.calories && (
                  <p className="text-sm text-destructive">
                    {errors.calories.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="category_id">Категория</Label>
              <select
                id="category_id"
                className={cn(selectClass)}
                defaultValue=""
                {...register("category_id")}
              >
                <option value="" disabled>
                  Выберите категорию
                </option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-sm text-destructive">
                  {errors.category_id.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="image">Изображение</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                className="h-auto py-1.5 file:mr-3 file:rounded file:border-0 file:bg-secondary file:px-2 file:py-1 file:text-sm"
                {...register("image")}
              />
              {errors.image && (
                <p className="text-sm text-destructive">
                  {errors.image.message}
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border"
                {...register("is_public")}
              />
              Публичная программа
            </label>

            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Сохранение…" : "Создать"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/programs")}
              >
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

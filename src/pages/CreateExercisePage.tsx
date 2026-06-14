import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { ArrowLeft } from "lucide-react";
import { ExerciseService } from "@/shared/service/exercise";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const schema = z.object({
  title: z.string().min(1, { error: "Введите название" }),
  description: z.string().min(1, { error: "Введите описание" }),
  video: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, { error: "Загрузите видео" })
    .refine((files) => files[0]?.type.startsWith("video/"), {
      error: "Файл должен быть видео",
    }),
});

type FormValues = z.infer<typeof schema>;

export function CreateExercisePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const create = useMutation({
    mutationFn: async (values: FormValues) => {
      // 1. создаём упражнение и получаем его id
      const exercise = await ExerciseService.createExercise({
        title: values.title,
        description: values.description,
      });
      // 2. загружаем видео на полученный id
      await ExerciseService.uploadExerciseVideo(exercise.id, values.video[0]);
      return exercise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      navigate("/exercises");
    },
    onError: (error) => {
      setServerError(
        isAxiosError(error)
          ? "Не удалось создать упражнение"
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/exercises")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-bold">Новое упражнение</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Параметры упражнения</CardTitle>
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Описание</Label>
              <textarea
                id="description"
                rows={4}
                className="flex w-full rounded-md border bg-background text-foreground px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="video">Видео</Label>
              <Input
                id="video"
                type="file"
                accept="video/*"
                className="h-auto py-1.5 file:mr-3 file:rounded file:border-0 file:bg-secondary file:px-2 file:py-1 file:text-sm"
                {...register("video")}
              />
              {errors.video && (
                <p className="text-sm text-destructive">
                  {errors.video.message}
                </p>
              )}
            </div>

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
                onClick={() => navigate("/exercises")}
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

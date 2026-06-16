import { useEffect, useRef } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
import { TrainService } from "@/shared/service/train";

const PAGE_SIZE = 20;

export function WorkoutsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["trains", "list"],
    queryFn: ({ pageParam }) =>
      TrainService.getTrains({ cursor: pageParam, limit: PAGE_SIZE }),
    initialPageParam: "",
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.next_cursor : undefined,
  });

  const trains = data?.pages.flatMap((page) => page.trains) ?? [];

  // Автоподгрузка при появлении «маяка» в зоне видимости.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const remove = useMutation({
    mutationFn: TrainService.deleteTrain,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trains"] }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Тренировки</h1>
        <Button onClick={() => navigate("/workouts/new")}>
          <Plus className="size-4" />
          Создать
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          {isLoading && <p className="text-muted-foreground">Загрузка…</p>}
          {isError && (
            <p className="text-destructive">Не удалось загрузить тренировки</p>
          )}
          {!isLoading && !isError && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Сложность</TableHead>
                  <TableHead>Длительность</TableHead>
                  <TableHead>Калории</TableHead>
                  <TableHead>Доступ</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {trains.map((train) => (
                  <TableRow
                    key={train.id}
                    onClick={() => navigate(`/workouts/${train.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">{train.title}</TableCell>
                    <TableCell>{train.type}</TableCell>
                    <TableCell>{train.difficulty}</TableCell>
                    <TableCell>{train.duration} мин</TableCell>
                    <TableCell>{train.calories} ккал</TableCell>
                    <TableCell>
                      {train.is_public ? "Публичная" : "Приватная"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          remove.mutate(train.id);
                        }}
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
          {/* Маяк автоподгрузки + индикатор следующей страницы */}
          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-4 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

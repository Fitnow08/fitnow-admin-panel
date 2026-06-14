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
import { ProgramService } from "@/shared/service/program";

export function ProgramsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["programs"],
    queryFn: ProgramService.getAllPrograms,
  });

  const remove = useMutation({
    mutationFn: ProgramService.deleteProgram,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["programs"] }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Программы</h1>
        <Button onClick={() => navigate("/programs/new")}>
          <Plus className="size-4" />
          Создать
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          {isLoading && <p className="text-muted-foreground">Загрузка…</p>}
          {isError && (
            <p className="text-destructive">Не удалось загрузить программы</p>
          )}
          {data && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Сложность</TableHead>
                  <TableHead>Недель</TableHead>
                  <TableHead>Тренировок</TableHead>
                  <TableHead>Доступ</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((program) => (
                  <TableRow
                    key={program.id}
                    onClick={() => navigate(`/programs/${program.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      {program.title}
                    </TableCell>
                    <TableCell>{program.difficulty}</TableCell>
                    <TableCell>{program.weeks}</TableCell>
                    <TableCell>{program.trains_count}</TableCell>
                    <TableCell>
                      {program.is_public ? "Публичная" : "Приватная"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          remove.mutate(program.id);
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
        </CardContent>
      </Card>
    </div>
  );
}

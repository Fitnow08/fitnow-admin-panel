import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
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
import { UserService } from "@/shared/service/user";

export function UsersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: UserService.getAllUsers,
  });

  const remove = useMutation({
    mutationFn: UserService.deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Пользователи</h1>
      <Card>
        <CardContent className="pt-6">
          {isLoading && <p className="text-muted-foreground">Загрузка…</p>}
          {isError && (
            <p className="text-destructive">
              Не удалось загрузить пользователей
            </p>
          )}
          {data && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Регистрация</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.title}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove.mutate(user.id)}
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

"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { Trash2 } from "lucide-react";
import { deleteReviewAction, deleteCommentAction } from "@/lib/actions/events";
import { INITIAL_ACTION_RESULT } from "@/types/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SubmitButton } from "@/components/forms/submit-button";

interface DeleteFeedbackButtonProps {
  type: "review" | "comment";
  itemId: string;
  eventSlug: string;
}

export function DeleteFeedbackButton({ type, itemId, eventSlug }: DeleteFeedbackButtonProps) {
  const [open, setOpen] = useState(false);
  const action = type === "review" ? deleteReviewAction : deleteCommentAction;
  const [state, formAction] = useFormState(action, INITIAL_ACTION_RESULT);
  const idField = type === "review" ? "reviewId" : "commentId";

  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state.ok]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
          />
        }
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span className="sr-only">Excluir</span>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {type === "review" ? "Excluir avaliação" : "Excluir comentário"}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {type === "review"
            ? "Tem certeza que deseja excluir esta avaliação?"
            : "Tem certeza que deseja excluir este comentário?"}{" "}
          Esta ação não pode ser desfeita.
        </p>
        {state.message && !state.ok && (
          <p className="text-xs text-destructive">{state.message}</p>
        )}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <form action={formAction}>
            <input type="hidden" name={idField} value={itemId} />
            <input type="hidden" name="eventSlug" value={eventSlug} />
            <SubmitButton variant="destructive" pendingText="Excluindo...">
              Confirmar exclusão
            </SubmitButton>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

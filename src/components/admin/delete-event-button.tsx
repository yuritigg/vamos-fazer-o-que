"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { Trash2 } from "lucide-react";
import { deleteEventAction } from "@/lib/actions/admin";
import { INITIAL_ACTION_RESULT } from "@/types/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SubmitButton } from "@/components/forms/submit-button";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useFormState(deleteEventAction, INITIAL_ACTION_RESULT);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" />}>
        <Trash2 className="mr-1 h-4 w-4" />
        Excluir
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Excluir evento</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.
        </p>
        {state.message && !state.ok && (
          <p className="text-xs text-destructive">{state.message}</p>
        )}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <form action={action}>
            <input type="hidden" name="eventId" value={eventId} />
            <SubmitButton variant="destructive" pendingText="Excluindo...">
              Confirmar exclusão
            </SubmitButton>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

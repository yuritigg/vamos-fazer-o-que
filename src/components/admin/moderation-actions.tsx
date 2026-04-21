"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { moderateEventFromForm } from "@/lib/actions/admin";
import { INITIAL_ACTION_RESULT } from "@/types/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/forms/submit-button";

interface ModerationActionsProps {
  eventId: string;
}

export function ModerationActions({ eventId }: ModerationActionsProps) {
  const [approveState, approveAction] = useFormState(moderateEventFromForm, INITIAL_ACTION_RESULT);
  const [rejectState, rejectAction] = useFormState(moderateEventFromForm, INITIAL_ACTION_RESULT);
  const [showRejectForm, setShowRejectForm] = useState(false);

  const state = approveState.message ? approveState : rejectState;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <form action={approveAction}>
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="status" value="aprovado" />
          <SubmitButton size="sm" pendingText="Aprovando...">
            Aprovar
          </SubmitButton>
        </form>
        {!showRejectForm && (
          <Button size="sm" variant="destructive" type="button" onClick={() => setShowRejectForm(true)}>
            Reprovar
          </Button>
        )}
      </div>

      {showRejectForm && (
        <form action={rejectAction} className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="status" value="reprovado" />
          <Textarea
            name="rejectionReason"
            placeholder="Motivo da reprovação (obrigatório)"
            rows={2}
            required
          />
          <div className="flex gap-2">
            <SubmitButton size="sm" variant="destructive" pendingText="Reprovando...">
              Confirmar reprovação
            </SubmitButton>
            <Button size="sm" variant="ghost" type="button" onClick={() => setShowRejectForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {state.message ? (
        <p className={`text-xs ${state.ok ? "text-emerald-600" : "text-destructive"}`}>{state.message}</p>
      ) : null}
    </div>
  );
}

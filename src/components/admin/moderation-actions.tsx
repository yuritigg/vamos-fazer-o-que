"use client";

import { useFormState } from "react-dom";
import { moderateEventFromForm } from "@/lib/actions/admin";
import { INITIAL_ACTION_RESULT } from "@/types/actions";
import { SubmitButton } from "@/components/forms/submit-button";

interface ModerationActionsProps {
  eventId: string;
}

export function ModerationActions({ eventId }: ModerationActionsProps) {
  const [approveState, approveAction] = useFormState(moderateEventFromForm, INITIAL_ACTION_RESULT);
  const [rejectState, rejectAction] = useFormState(moderateEventFromForm, INITIAL_ACTION_RESULT);

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
        <form action={rejectAction}>
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="status" value="reprovado" />
          <input type="hidden" name="rejectionReason" value="Reprovado pela moderação." />
          <SubmitButton size="sm" variant="destructive" pendingText="Reprovando...">
            Reprovar
          </SubmitButton>
        </form>
      </div>
      {state.message ? (
        <p className={`text-xs ${state.ok ? "text-emerald-600" : "text-destructive"}`}>{state.message}</p>
      ) : null}
    </div>
  );
}

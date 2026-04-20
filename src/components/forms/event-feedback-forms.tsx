"use client";

import { useFormState } from "react-dom";
import { createCommentAction, createReviewAction } from "@/lib/actions/events";
import { INITIAL_ACTION_RESULT } from "@/types/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/forms/submit-button";

interface EventFeedbackFormsProps {
  eventId: string;
  eventSlug: string;
}

export function ReviewForm({ eventId, eventSlug }: EventFeedbackFormsProps) {
  const [state, action] = useFormState(createReviewAction, INITIAL_ACTION_RESULT);

  return (
    <form action={action} className="space-y-2 rounded-md border p-3">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="eventSlug" value={eventSlug} />
      <div className="space-y-2">
        <label htmlFor={`rating-${eventId}`} className="text-sm font-medium">
          Nota (1 a 5)
        </label>
        <Input id={`rating-${eventId}`} name="rating" type="number" min={1} max={5} required />
      </div>
      <Textarea name="comment" rows={3} placeholder="Deixe seu feedback sobre o evento." />
      <SubmitButton size="sm" pendingText="Enviando...">
        Enviar avaliação
      </SubmitButton>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-600" : "text-destructive"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}

export function CommentForm({ eventId, eventSlug }: EventFeedbackFormsProps) {
  const [state, action] = useFormState(createCommentAction, INITIAL_ACTION_RESULT);

  return (
    <form action={action} className="space-y-2 rounded-md border p-3">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="eventSlug" value={eventSlug} />
      <Textarea name="message" rows={3} placeholder="Escreva seu comentário." required />
      <SubmitButton size="sm" pendingText="Enviando...">
        Comentar
      </SubmitButton>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-600" : "text-destructive"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}

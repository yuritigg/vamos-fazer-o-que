"use client";

import { useFormState } from "react-dom";
import { Star } from "lucide-react";
import { createCommentAction, createReviewAction } from "@/lib/actions/events";
import { INITIAL_ACTION_RESULT } from "@/types/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forms/submit-button";

interface EventFeedbackFormsProps {
  eventId: string;
  eventSlug: string;
}

export function ReviewForm({ eventId, eventSlug }: EventFeedbackFormsProps) {
  const [state, action] = useFormState(createReviewAction, INITIAL_ACTION_RESULT);

  return (
    <form action={action} className="space-y-3 rounded-xl bg-muted/40 p-4">
      <div className="flex items-center gap-1.5">
        <Star className="h-3.5 w-3.5 text-primary" />
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Deixar avaliação
        </p>
      </div>
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="eventSlug" value={eventSlug} />
      <div className="space-y-1.5">
        <Label htmlFor={`rating-${eventId}`} className="text-xs">
          Nota (1 a 5)
        </Label>
        <Input
          id={`rating-${eventId}`}
          name="rating"
          type="number"
          min={1}
          max={5}
          required
          className="h-9 w-24 text-sm"
        />
      </div>
      <Textarea
        name="comment"
        rows={2}
        placeholder="Compartilhe sua experiência com o evento."
        className="resize-none text-sm"
      />
      <SubmitButton size="sm" pendingText="Enviando...">
        Enviar avaliação
      </SubmitButton>
      {state.message && (
        <p className={`text-xs ${state.ok ? "text-emerald-600" : "text-destructive"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}

export function CommentForm({ eventId, eventSlug }: EventFeedbackFormsProps) {
  const [state, action] = useFormState(createCommentAction, INITIAL_ACTION_RESULT);

  return (
    <form action={action} className="space-y-3 rounded-xl bg-muted/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Deixar comentário
      </p>
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="eventSlug" value={eventSlug} />
      <Textarea
        name="message"
        rows={2}
        placeholder="Escreva seu comentário sobre o evento."
        required
        className="resize-none text-sm"
      />
      <SubmitButton size="sm" pendingText="Enviando...">
        Comentar
      </SubmitButton>
      {state.message && (
        <p className={`text-xs ${state.ok ? "text-emerald-600" : "text-destructive"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}

export interface ActionResult {
  ok: boolean;
  message: string;
}

export const INITIAL_ACTION_RESULT: ActionResult = {
  ok: false,
  message: "",
};

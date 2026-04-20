export type UserRole = "espectador" | "organizador";

export interface AppUserMetadata {
  fullName: string;
  role: UserRole;
}

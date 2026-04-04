import { Role } from "@prisma/client";

export interface IApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
}

export interface IJwtPayload {
  id: number;
  email?: string | null;  // Opsional: warga login via noTelepon, email bisa null
  role: Role;
  wargaId?: number;
}

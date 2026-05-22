import { z } from "zod";

export const personSchema = z.object({
  nombres: z.string().min(2, "Los nombres son obligatorios"),
  apellidos: z.string().min(2, "Los apellidos son obligatorios"),
  tipoDocumento: z.enum(["CC", "CE", "Pasaporte"]),
  documento: z.string().min(5, "Documento inválido"),
  direccion: z.string().min(5, "Dirección obligatoria"),
  telefono: z
    .string()
    .regex(/^[0-9]+$/, "Solo números")
    .min(7, "Teléfono inválido"),
  ciudad: z.string().min(2, "Ciudad obligatoria"),
  usuario: z.string().min(4, "Mínimo 4 caracteres"),
  contrasena: z.string().min(6, "Mínimo 6 caracteres"),
});

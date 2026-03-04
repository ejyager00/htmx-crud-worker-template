import { z } from "zod";

export const NoteSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().max(10000).default(""),
});

export type NoteInput = z.infer<typeof NoteSchema>;

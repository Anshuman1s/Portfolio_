import type { Algorithm, Options } from "@node-rs/argon2";

// OWASP-recommended Argon2id parameters (19 MiB, 2 iterations, 1 lane).
// Shared by the app and the seed script.
export const argonOptions: Options = {
  // Algorithm is an ambient const enum; 2 === Algorithm.Argon2id.
  algorithm: 2 as Algorithm.Argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

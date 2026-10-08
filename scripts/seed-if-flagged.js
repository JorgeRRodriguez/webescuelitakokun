// Se ejecuta en cada arranque del contenedor (ver "start" en package.json).
// Como la base es SQLite (un archivo dentro del Volume de Railway), solo se
// puede sembrar/reiniciar los datos de ejemplo desde DENTRO del contenedor
// en ejecución — por eso esto corre como parte del start command en vez de
// como un comando aparte vía `railway run`.
//
// Para (re)generar los datos de ejemplo en producción:
//   1. En Railway, agrega la variable SEED_ON_BOOT=true al servicio.
//   2. Redeploy (o espera a que reinicie).
//   3. Quita la variable (o ponla en "false") para que no se vuelva a
//      reiniciar la base en cada reinicio/redeploy futuro.
const { execSync } = require("node:child_process");

if (process.env.SEED_ON_BOOT === "true") {
  console.log("[seed-if-flagged] SEED_ON_BOOT=true — ejecutando prisma/seed.ts...");
  execSync("npm run db:seed", { stdio: "inherit" });
} else {
  console.log("[seed-if-flagged] SEED_ON_BOOT no está en 'true', se omite el seed.");
}

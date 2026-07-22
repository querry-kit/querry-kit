export const ENV = {
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://workboard:workboard@localhost:54329/workboard?schema=public',
  port: Number(process.env.PORT ?? 3101),
};

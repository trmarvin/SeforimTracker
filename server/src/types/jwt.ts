export type JwtUserPayload = {
  userId: number;
  email: string;
  role?: "user" | "admin";
};

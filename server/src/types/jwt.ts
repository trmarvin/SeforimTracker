export type JwtUserPayload = {
  userId: string;
  email: string;
  role?: "user" | "admin";
};

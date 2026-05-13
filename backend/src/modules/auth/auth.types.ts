export type RegisterInput = {
  email: string;
  password: string;
  fullName?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};
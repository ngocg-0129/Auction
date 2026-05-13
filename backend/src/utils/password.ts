import bcrypt from "bcryptjs";

// mã hóa paswd trước khi lưu DB
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// so sánh paswd login với paswd đã mã hóa 
export async function comparePassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
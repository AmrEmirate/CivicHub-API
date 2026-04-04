import { AuthService } from "../src/service/auth.service";
import { AuthRepository } from "../src/repositories/auth.repository";
import bcrypt from "bcrypt";

jest.mock("../src/repositories/auth.repository");
jest.mock("bcrypt");

describe("AuthService", () => {
  it("should fail login if user not found", async () => {
    (AuthRepository.findUserByEmail as jest.Mock).mockResolvedValue(null);
    await expect(AuthService.login("wrong@mail.com", "pass")).rejects.toThrow("Akun dengan email tersebut tidak ditemukan");
  });

  it("should fail login if password incorrect", async () => {
    (AuthRepository.findUserByEmail as jest.Mock).mockResolvedValue({ id: 1, email: "test@mail.com", password: "hashed", warga: null });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(AuthService.login("test@mail.com", "wrongpass")).rejects.toThrow("Password salah");
  });
});

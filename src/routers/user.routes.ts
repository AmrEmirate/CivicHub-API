import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { authorizeFilters } from "../middleware/role";
import prisma from "../config/prisma";

const router = Router();

// Hanya SUPER_ADMIN yang bisa lihat dan kelola semua user
router.use(authenticate);

// GET /api/users — Daftar semua user
router.get("/", authorizeFilters(["SUPER_ADMIN"]), async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        noTelepon: true,
        role: true,
        createdAt: true,
        warga: {
          select: { id: true, noRumah: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/me — Profil user yang sedang login
router.get("/me", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        noTelepon: true,
        role: true,
        createdAt: true,
      }
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/me — Update profil sendiri
router.put("/me", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { name, email, noTelepon } = req.body;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(noTelepon && { noTelepon }),
      },
      select: {
        id: true, name: true, email: true, noTelepon: true, role: true
      }
    });
    res.status(200).json({ message: "Profil berhasil diperbarui", user: updated });
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: "Email atau nomor telepon sudah digunakan" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

export default router;

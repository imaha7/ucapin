import { PrismaClient, TemplateTier, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const catalog = [
  ["savana", "Savana Senja", "Rustic", "Hangat, teduh, dan penuh cerita.", "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=750&q=85", 99000, TemplateTier.STANDARD],
  ["seruni", "Seruni Garden", "Floral", "Sentuhan bunga untuk hari istimewa.", "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=750&q=85", 129000, TemplateTier.PREMIUM],
  ["senandika", "Senandika", "Minimalis", "Sederhana, elegan, selamanya.", "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=750&q=85", 99000, TemplateTier.STANDARD],
  ["aksara", "Aksara Jawa", "Tradisional", "Merayakan cinta dan akar budaya.", "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=750&q=85", 149000, TemplateTier.PREMIUM],
  ["purnama", "Purnama", "Modern", "Nuansa modern dengan rona lembut.", "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?auto=format&fit=crop&w=750&q=85", 129000, TemplateTier.PREMIUM],
  ["arca", "Arca Putih", "Minimalis", "Ruang yang lapang untuk kisah kalian.", "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=750&q=85", 99000, TemplateTier.STANDARD],
] as const;

async function main() {
  for (const [slug, name, category, description, imageUrl, basePrice, tier] of catalog) {
    await prisma.template.upsert({
      where: { slug },
      update: { name, category, description, imageUrl, basePrice, tier, isActive: true },
      create: { slug, name, category, description, imageUrl, basePrice, tier },
    });
  }
  await prisma.pricingRule.upsert({
    where: { id: "default-pricing" },
    update: {},
    create: { id: "default-pricing", name: "Harga custom default" },
  });

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail || adminPassword) {
    if (!adminEmail || !adminPassword || adminPassword.length < 10) {
      throw new Error("Set both ADMIN_EMAIL and an ADMIN_PASSWORD of at least 10 characters.");
    }
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: UserRole.ADMIN },
      create: {
        email: adminEmail,
        name: "Administrator",
        passwordHash: await hash(adminPassword, 12),
        role: UserRole.ADMIN,
      },
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());

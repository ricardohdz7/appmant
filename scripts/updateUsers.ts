import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function generateSimpleUsername(branchName: string): string {
  // Extract text after '|' if it exists, otherwise use the whole name
  const parts = branchName.split('|');
  return parts.length > 1 ? parts[1].trim() : parts[0].trim();
}

async function main() {
  const branchUsers = await prisma.user.findMany({
    where: { role: "branch", branchId: { not: null } },
    include: { branch: true }
  });
  
  for (const user of branchUsers) {
    if (user.branch) {
      const newUsername = generateSimpleUsername(user.branch.name);
      console.log(`Updating ${user.username} to "${newUsername}"`);
      await prisma.user.update({
        where: { id: user.id },
        data: { username: newUsername }
      });
    }
  }
  console.log("Done updating users.");
}

main().catch(console.error).finally(() => prisma.$disconnect());

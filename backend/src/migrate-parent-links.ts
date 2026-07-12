import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const members = await prisma.familyMember.findMany({
    where: { parentMemberId: { not: null } },
  });

  console.log(`Found ${members.length} existing parent links to migrate`);

  for (const member of members) {
    await prisma.parentLink.create({
      data: {
        parentId: member.parentMemberId!,
        childId: member.id,
      },
    });
    console.log(`Migrated: ${member.id} -> parent ${member.parentMemberId}`);
  }

  console.log("Done");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
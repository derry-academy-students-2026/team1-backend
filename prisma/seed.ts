import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.jobRole.deleteMany();
  await prisma.capability.deleteMany();
  await prisma.band.deleteMany();

  const capability = await prisma.capability.create({
    data: { capabilityName: "Engineering" },
  });

  const band = await prisma.band.create({
    data: { bandName: "Band 2" },
  });

  await prisma.jobRole.createMany({
    data: [
      { roleName: "Software Engineer", location: "Derry", closingDate: new Date("2026-08-11"), status: "open", capabilityId: capability.capabilityId, bandId: band.bandId },
      { roleName: "Test Engineer", location: "Gdansk", closingDate: new Date("2026-08-14"), status: "open", capabilityId: capability.capabilityId, bandId: band.bandId },
      { roleName: "Project Manager", location: "Belfast", closingDate: new Date("2026-08-23"), status: "closed", capabilityId: capability.capabilityId, bandId: band.bandId },
    ],
    skipDuplicates: true,
  });
}

main().finally(() => prisma.$disconnect());


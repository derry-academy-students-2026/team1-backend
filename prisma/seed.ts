import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const SEED_USER_EMAIL = "test1@example.com";
const SEED_USER_PASSWORD = "Password123!";

async function main() {
	await prisma.jobRole.deleteMany();
	await prisma.status.deleteMany();
	await prisma.capability.deleteMany();
	await prisma.band.deleteMany();

	const capability = await prisma.capability.create({
		data: { capabilityName: "Engineering" },
	});

	const band = await prisma.band.create({
		data: { bandName: "Band 2" },
	});

	const openStatus = await prisma.status.create({
		data: { statusName: "open" },
	});

	const closedStatus = await prisma.status.create({
		data: { statusName: "closed" },
	});

	await prisma.jobRole.createMany({
		data: [
			{
				roleName: "Software Engineer",
				location: "Derry",
				closingDate: new Date("2026-08-11"),
				statusId: openStatus.statusId,
				capabilityId: capability.capabilityId,
				bandId: band.bandId,
				description: "Build and maintain product features.",
				responsibilities: "Design, code, review, and deploy.",
				sharepointUrl: "https://example.sharepoint.com/software-engineer",
				numberOfOpenPositions: 1,
			},
			{
				roleName: "Test Engineer",
				location: "Gdansk",
				closingDate: new Date("2026-08-14"),
				statusId: openStatus.statusId,
				capabilityId: capability.capabilityId,
				bandId: band.bandId,
				description: "Own test strategy and quality gates.",
				responsibilities: "Automate tests and report quality risks.",
				sharepointUrl: "https://example.sharepoint.com/test-engineer",
				numberOfOpenPositions: 2,
			},
			{
				roleName: "Project Manager",
				location: "Belfast",
				closingDate: new Date("2026-08-23"),
				statusId: closedStatus.statusId,
				capabilityId: capability.capabilityId,
				bandId: band.bandId,
				description: "Coordinate delivery across teams.",
				responsibilities: "Plan milestones and manage stakeholders.",
				sharepointUrl: "https://example.sharepoint.com/project-manager",
				numberOfOpenPositions: 1,
			},
		],
		skipDuplicates: true,
	});

	const passwordHash = await argon2.hash(SEED_USER_PASSWORD);

	await prisma.user.upsert({
		where: { email: SEED_USER_EMAIL },
		update: { passwordHash },
		create: { email: SEED_USER_EMAIL, passwordHash },
	});
}

main().finally(() => prisma.$disconnect());

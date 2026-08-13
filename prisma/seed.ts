import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
}

main().finally(() => prisma.$disconnect());

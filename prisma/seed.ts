import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const SEED_USER_EMAIL = "test1@example.com";
const SEED_USER_PASSWORD = "Password123!";

/** Recreates reference data and the test user in the development database. */
async function main() {
	await prisma.jobRole.deleteMany();
	await prisma.status.deleteMany();
	await prisma.capability.deleteMany();
	await prisma.band.deleteMany();

	const engineering = await prisma.capability.create({
		data: { capabilityName: "Engineering" },
	});

	const data = await prisma.capability.create({
		data: { capabilityName: "Data" },
	});

	const product = await prisma.capability.create({
		data: { capabilityName: "Product" },
	});

	const band2 = await prisma.band.create({
		data: { bandName: "Band 2" },
	});

	const band3 = await prisma.band.create({
		data: { bandName: "Band 3" },
	});

	const band4 = await prisma.band.create({
		data: { bandName: "Band 4" },
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
				capabilityId: engineering.capabilityId,
				bandId: band2.bandId,
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
				capabilityId: engineering.capabilityId,
				bandId: band2.bandId,
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
				capabilityId: engineering.capabilityId,
				bandId: band2.bandId,
				description: "Coordinate delivery across teams.",
				responsibilities: "Plan milestones and manage stakeholders.",
				sharepointUrl: "https://example.sharepoint.com/project-manager",
				numberOfOpenPositions: 1,
			},
			{
				roleName: "Data Engineer",
				location: "Belfast",
				closingDate: new Date("2026-09-01"),
				statusId: openStatus.statusId,
				capabilityId: data.capabilityId,
				bandId: band3.bandId,
				description: "Build and maintain data pipelines for analytics.",
				responsibilities:
					"Design ETL jobs, model data, and ensure data quality.",
				sharepointUrl: "https://example.sharepoint.com/data-engineer",
				numberOfOpenPositions: 2,
			},
			{
				roleName: "Frontend Developer",
				location: "Derry",
				closingDate: new Date("2026-08-30"),
				statusId: openStatus.statusId,
				capabilityId: engineering.capabilityId,
				bandId: band2.bandId,
				description: "Build accessible, responsive user interfaces.",
				responsibilities:
					"Implement UI components and collaborate with designers.",
				sharepointUrl: "https://example.sharepoint.com/frontend-developer",
				numberOfOpenPositions: 1,
			},
			{
				roleName: "Product Manager",
				location: "Belfast",
				closingDate: new Date("2026-09-15"),
				statusId: openStatus.statusId,
				capabilityId: product.capabilityId,
				bandId: band4.bandId,
				description: "Own the roadmap for a customer-facing product area.",
				responsibilities:
					"Define requirements, prioritise backlog, and work with stakeholders.",
				sharepointUrl: "https://example.sharepoint.com/product-manager",
				numberOfOpenPositions: 1,
			},
			{
				roleName: "DevOps Engineer",
				location: "Gdansk",
				closingDate: new Date("2026-09-05"),
				statusId: openStatus.statusId,
				capabilityId: engineering.capabilityId,
				bandId: band3.bandId,
				description: "Improve deployment pipelines and platform reliability.",
				responsibilities:
					"Maintain CI/CD, monitor infrastructure, and automate operations.",
				sharepointUrl: "https://example.sharepoint.com/devops-engineer",
				numberOfOpenPositions: 1,
			},
			{
				roleName: "UX Designer",
				location: "Derry",
				closingDate: new Date("2026-08-01"),
				statusId: closedStatus.statusId,
				capabilityId: product.capabilityId,
				bandId: band2.bandId,
				description: "Design end-to-end user experiences for new features.",
				responsibilities:
					"Run user research, produce wireframes, and validate prototypes.",
				sharepointUrl: "https://example.sharepoint.com/ux-designer",
				numberOfOpenPositions: 1,
			},
		],
		skipDuplicates: true,
	});

	const passwordHash = await argon2.hash(SEED_USER_PASSWORD);

	await prisma.user.upsert({
		where: { email: SEED_USER_EMAIL },
		update: { passwordHash, role: "user" },
		create: { email: SEED_USER_EMAIL, passwordHash, role: "user" },
	});

	const additionalUsers = [
		{
			email: "admin@example.com",
			password: "AdminPass123!",
			role: "admin",
		},
		{
			email: "test2@example.com",
			password: "Password123!",
			role: "user",
		},
		{
			email: "test3@example.com",
			password: "Password123!",
			role: "user",
		},
	];

	for (const { email, password, role } of additionalUsers) {
		const hash = await argon2.hash(password);
		await prisma.user.upsert({
			where: { email },
			update: { passwordHash: hash, role },
			create: { email, passwordHash: hash, role },
		});
	}
}

/** Disconnects Prisma after the seed operation completes. */
const disconnect = (): Promise<void> => prisma.$disconnect();

main().finally(disconnect);

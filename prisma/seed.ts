import { hash } from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Password123!";

const users: {
  name: string;
  email: string;
  role: Role;
  badgeNumber: string;
}[] = [
  {
    name: "Ayesha Rahman",
    email: "admin@ems.local",
    role: "ADMIN",
    badgeNumber: "ADM-001",
  },
  {
    name: "Imran Qureshi",
    email: "supervisor@ems.local",
    role: "SUPERVISOR",
    badgeNumber: "SUP-014",
  },
  {
    name: "Sara Malik",
    email: "examiner1@ems.local",
    role: "EXAMINER",
    badgeNumber: "EXM-021",
  },
  {
    name: "Hassan Raza",
    email: "examiner2@ems.local",
    role: "EXAMINER",
    badgeNumber: "EXM-022",
  },
  {
    name: "Nadia Hussain",
    email: "custodian1@ems.local",
    role: "CUSTODIAN",
    badgeNumber: "CUS-031",
  },
  {
    name: "Bilal Ahmed",
    email: "custodian2@ems.local",
    role: "CUSTODIAN",
    badgeNumber: "CUS-032",
  },
];

async function main() {
  const passwordHash = await hash(DEMO_PASSWORD, 12);

  console.log("\nSeeding EMS users…\n");

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        badgeNumber: u.badgeNumber,
        passwordHash,
        isActive: true,
      },
      create: {
        name: u.name,
        email: u.email,
        role: u.role,
        badgeNumber: u.badgeNumber,
        passwordHash,
        isActive: true,
      },
    });

    console.log(
      `  [${user.role.padEnd(10)}] ${user.name.padEnd(16)}  ${user.email}  /  ${DEMO_PASSWORD}`
    );
  }

  console.log("\nSeed complete. Use any email above with password:", DEMO_PASSWORD);

  const systemHash = await hash(`system-no-login-seed`, 12);
  await prisma.user.upsert({
    where: { email: "system@ems.local" },
    update: { isActive: false, name: "System" },
    create: {
      name: "System",
      email: "system@ems.local",
      passwordHash: systemHash,
      role: "ADMIN",
      badgeNumber: "SYS-000",
      isActive: false,
    },
  });
  console.log("  System audit actor ensured (system@ems.local, inactive).\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

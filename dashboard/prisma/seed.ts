import { prisma } from "../src/lib/prisma"
import { auth } from "../src/lib/auth"

async function main() {
  console.log("🌱 Seeding SubVerif Pro instructors...")

  const defaultInstructors = [
    {
      name: "Jean Dupont",
      email: "jean.dupont@subverif.pro",
      password: "Password123!",
      fullName: "Jean Dupont",
      isActive: true,
    },
    {
      name: "Claire Martin",
      email: "claire.martin@subverif.pro",
      password: "Password123!",
      fullName: "Claire Martin",
      isActive: true,
    },
  ]

  for (const instructor of defaultInstructors) {
    const existing = await prisma.user.findUnique({
      where: { email: instructor.email },
    })

    if (!existing) {
      console.log(`Creating instructor account for: ${instructor.email}`)
      try {
        await auth.api.signUpEmail({
          body: {
            name: instructor.name,
            email: instructor.email,
            password: instructor.password,
            fullName: instructor.fullName,
            isActive: instructor.isActive,
          },
        })
        console.log(`✅ Created: ${instructor.email}`)
      } catch (err) {
        console.error(`Error creating ${instructor.email}:`, err)
      }
    } else {
      console.log(`ℹ️ Instructor already exists: ${instructor.email}`)
    }
  }

  console.log("🌱 Seeding complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

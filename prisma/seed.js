const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const userData = [
  {
    name: 'NICK ANDEREGG',
    email: 'nick@example.com',
    posts: {
      create: [
        {
          title: 'Fixing problems before they begin: How Code Review AI provides actionable feedback for common mistakes',
          content: 'https://cto.ai/blog/code-review-ai/',
          published: true,
          viewCount: 100,
        },
      ],
    },
  },
]

async function main() {
  console.log(`Start seeding ...`)
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    })
    console.log(`Created user with id: ${user.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

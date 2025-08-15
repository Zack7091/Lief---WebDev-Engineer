const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const locs = await prisma.location.findMany({ orderBy: { createdAt: 'desc' } });
  if (locs.length <= 1) { 
    console.log('Only one or zero locations - nothing to delete'); 
    process.exit(0); 
  }
  const toDelete = locs.slice(1).map(l => l.id);
  await prisma.location.deleteMany({ where: { id: { in: toDelete } } });
  console.log('Deleted locations:', toDelete);
  await prisma.$disconnect();
})();

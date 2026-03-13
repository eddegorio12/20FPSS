import "dotenv/config";
import prisma from './src/lib/prisma';

async function main() {
  await prisma.user.update({
    where: { email: 'moontonng13@gmail.com' },
    data: { role: 'ADMIN' }
  });
  console.log("Promoted moontonng13 to ADMIN");
}
main();

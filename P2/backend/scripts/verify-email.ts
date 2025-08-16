import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyUserEmail(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });
    
    console.log('✅ Email verificado exitosamente para:', email);
    console.log('Usuario:', {
      id: user.id,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Obtener el email desde los argumentos de línea de comandos
const email = process.argv[2];

if (!email) {
  console.error('❌ Por favor proporciona un email');
  console.log('Uso: npx ts-node scripts/verify-email.ts <email>');
  process.exit(1);
}

verifyUserEmail(email);
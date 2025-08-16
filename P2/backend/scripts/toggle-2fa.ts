import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function toggle2FA(email: string, enable: boolean) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        twoFactorEnabled: enable,
      },
    });
    
    console.log(`✅ 2FA ${enable ? 'habilitado' : 'deshabilitado'} para:`, email);
    console.log('Estado actual:', {
      id: user.id,
      email: user.email,
      twoFactorEnabled: user.twoFactorEnabled,
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Obtener los argumentos
const email = process.argv[2];
const action = process.argv[3]; // 'enable' o 'disable'

if (!email || !action) {
  console.error('❌ Faltan argumentos');
  console.log('Uso: npx ts-node scripts/toggle-2fa.ts <email> <enable|disable>');
  console.log('Ejemplo: npx ts-node scripts/toggle-2fa.ts user@example.com disable');
  process.exit(1);
}

const enable = action === 'enable';
toggle2FA(email, enable);
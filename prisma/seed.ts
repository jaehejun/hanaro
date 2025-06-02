import prisma from '@/lib/prisma/prisma';
import { Role } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    const adminEmail = process.env.ADMIN_EMAIL || 'super@hanaro.com';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
        throw new Error('관리자 비밀번호가 설정되지 않았습니다.');
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: hashedPassword,
            nickname: '관리자',
            role: Role.ADMIN,
        },
    });
    console.log(`관리자 계정 생성 완료 : ${adminUser.email}`);

    const defaultCategories = [
        { name: 'JavaScript' },
        { name: 'TypeScript' },
        { name: 'React' },
        { name: 'etc' },
    ];

    for (const category of defaultCategories) {
        const createdCategory = await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: {
                name: category.name,
            },
        });
        console.log(`기본 카테고리 생성 완료 : ${createdCategory.name}`);
    }
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
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

    const userEmail = process.env.USER_EMAIL || 'normal@hanaro.com';
    const userPassword = process.env.USER_PASSWORD;

    if (!userPassword) {
        throw new Error('일반 사용자 비밀번호가 설정되지 않았습니다.');
    }

    const hashedUserPassword = await bcrypt.hash(userPassword, 10);

    const normalUser = await prisma.user.upsert({
        where: { email: userEmail },
        update: {},
        create: {
            email: userEmail,
            password: hashedUserPassword,
            nickname: '일반 사용자',
            role: Role.USER,
        },
    });
    console.log(`일반 사용자 계정 생성 완료 : ${normalUser.email}`);

    const defaultCategories = [
        { name: 'JavaScript' },
        { name: 'TypeScript' },
        { name: 'React' },
        { name: 'Etc' },
    ];

    // const defaultPosts = [
    //     { title: 'JavaScript 기본 게시글', content: 'JavaScript를 알아보자', categoryName: 'JavaScript', authorId: adminUser.id },
    //     { title: 'TypeScript 기본 게시글', content: 'TypeScript를 알아보자.', categoryName: 'TypeScript', authorId: adminUser.id },
    //     { title: 'React 기본 게시글', content: 'React를 알아보자', categoryName: 'React', authorId: adminUser.id },
    //     { title: 'Etc 기본 게시글', content: 'etc를 알아보자', categoryName: 'etc', authorId: adminUser.id },
    //   ];

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
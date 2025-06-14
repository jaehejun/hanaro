import prisma from '@/lib/prisma/prisma';
import { Role } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

import dotenv from 'dotenv';
dotenv.config({path:'.env.local'});

async function main() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    console.log('관리자 이메일:', adminEmail);
    console.log('pass:', adminPassword);

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

    const stopwords = [
        '은', '는', '이', '가', '을', '를', '에', '의', '와', '과',
        '도', '으로', '로', '에서', '에게', '한', '하다', '그리고', '하지만', '또한'
    ];

    for (const word of stopwords) {
        await prisma.stopword.upsert({
            where: { word: word },
            update: {},
            create: {  word: word},
        });
    }
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
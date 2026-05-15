"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getMe = getMe;
const db_1 = require("../../config/db");
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
async function register(input) {
    const { email, password, fullName } = input;
    if (!email || !password) {
        throw new Error("Email and password are required");
    }
    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
    }
    const existingUser = await db_1.prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new Error("Email already exists");
    }
    const passwordHash = await (0, password_1.hashPassword)(password);
    const user = await db_1.prisma.user.create({
        data: {
            email,
            passwordHash,
            fullName,
        },
        select: {
            id: true,
            email: true,
            fullName: true,
            createdAt: true,
        },
    });
    const token = (0, jwt_1.signToken)({
        userId: user.id,
        email: user.email,
    });
    return {
        user,
        token,
    };
}
async function login(input) {
    const { email, password } = input;
    if (!email || !password) {
        throw new Error("Email and password are required");
    }
    const user = await db_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error("Invalid email or password");
    }
    const isPasswordValid = await (0, password_1.comparePassword)(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }
    const token = (0, jwt_1.signToken)({
        userId: user.id,
        email: user.email,
    });
    return {
        user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            createdAt: user.createdAt,
        },
        token,
    };
}
async function getMe(userId) {
    const user = await db_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            fullName: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    return user;
}

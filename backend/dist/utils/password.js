"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// mã hóa paswd trước khi lưu DB
async function hashPassword(password) {
    const saltRounds = 10;
    return bcryptjs_1.default.hash(password, saltRounds);
}
// so sánh paswd login với paswd đã mã hóa 
async function comparePassword(password, passwordHash) {
    return bcryptjs_1.default.compare(password, passwordHash);
}

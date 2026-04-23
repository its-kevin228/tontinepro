"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const generateToken = (userId, role) => {
    return jsonwebtoken_1.default.sign({ userId, role }, process.env.JWT_SECRET || "secret", {
        expiresIn: "7d",
    });
};
const register = async (req, res) => {
    const { email, password, name, role } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    try {
        const user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role || "MEMBER",
            },
        });
        const token = generateToken(user.id, user.role);
        res.json({ user: { id: user.id, email: user.email, role: user.role }, token });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
    }
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé" });
    }
    const valid = await bcrypt_1.default.compare(password, user.password);
    if (!valid) {
        return res.status(401).json({ error: "Mot de passe invalide" });
    }
    const token = generateToken(user.id, user.role);
    res.json({ user: { id: user.id, email: user.email, role: user.role }, token });
};
exports.login = login;
const me = async (req, res) => {
    const userId = req.user.userId;
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true },
    });
    res.json({ user });
};
exports.me = me;

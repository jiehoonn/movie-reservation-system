import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET!
const SALT_ROUNDS = 12

export const register = async (req: Request, res: Response): Promise<void> => {
    const { full_name, username, email, password } = req.body

    // Validate required fields
    if (!full_name || !username || !email || !password) {
        res.status(400).json({ error: 'All fields are required' })
        return
    }

    try {
        // Check if email or username already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        })

        if (existingUser) {
            res.status(409).json({ error: 'Email or username already taken' })
            return
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

        // Create user
        const user = await prisma.user.create({
            data: {
                full_name,
                username,
                email,
                password: hashedPassword
            }
        })

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        )

        res.status(201).json({
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                username: user.username,
                email: user.email,
                role: user.role
            }
        })

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body

    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' })
        return
    }

    try {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        })

        // Same error message for user not found and wrong password
        // Prevents email enumeration attacks
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' })
            return
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password)

        if (!passwordMatch) {
            res.status(401).json({ error: 'Invalid credentials' })
            return
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        )

        res.status(200).json({
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                username: user.username,
                email: user.email,
                role: user.role
            }
        })

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}
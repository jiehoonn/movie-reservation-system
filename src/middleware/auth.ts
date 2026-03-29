import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export interface AuthRequest extends Request {
    userId?: number
    userRole?: string
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authentication required' })
        return
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number, role: string }
        req.userId = decoded.userId
        req.userRole = decoded.role
        next()
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' })
    }
}

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.userRole !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' })
        return
    }
    next()
}
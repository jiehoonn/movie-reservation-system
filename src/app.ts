import 'dotenv/config'
import express from 'express'
import { prisma } from './lib/prisma'
import authRouter from './routes/auth'

const app = express()

app.use(express.json())

app.use('/api/auth', authRouter)

app.get('/', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`
        res.status(200).json({ status: 'ok', database: 'connected' })
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected' })
    }
})

export default app
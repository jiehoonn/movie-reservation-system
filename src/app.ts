import 'dotenv/config'
import express from 'express'
import { prisma } from './lib/prisma'

const app = express()

app.use(express.json())

app.get('/', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`
        res.status(200).json({ status: 'ok', database: 'connected' })
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected' })
    }
})

export default app
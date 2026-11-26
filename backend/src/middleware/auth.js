import crypto from 'node:crypto';
import { prisma } from '../server.js';
export async function auth(req, res, next) {
  const sessionId = req.cookies.session;
  if (!sessionId) return res.status(401).json({ message: 'Authentication required' });
  const session = await prisma.session.findUnique({ where: { id: sessionId }, include: { user: true } });
  if (!session || session.expiresAt < new Date()) { if (session) await prisma.session.delete({ where: { id: session.id } }); return res.status(401).json({ message: 'Session expired' }); }
  req.user = session.user; next();
}
export function allow(...roles) { return (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'You do not have permission for this action' }); }
export function newSessionId() { return crypto.randomBytes(32).toString('hex'); }

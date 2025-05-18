import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

// Custom token for request body
morgan.token('body', (req: any) => {
  const body = { ...req.body };
  if (body.password) body.password = '***';
  if (body.newPassword) body.newPassword = '***';
  return JSON.stringify(body);
});

// Development logger
export const devLogger = morgan(':method :url :status :response-time ms - :body');

// Production logger
export const prodLogger = morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
  { stream: accessLogStream }
); 
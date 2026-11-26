import 'dotenv/config';

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set');

const response = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email, password })
});
console.log(JSON.stringify({ status: response.status, body: await response.text() }));

import 'dotenv/config';

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set');

const login = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const cookies = login.headers.get('set-cookie');
const session = cookies?.split(';')[0];
for (const endpoint of ['dashboard', 'faculty', 'training', 'participation', 'training-database', 'dropdowns']) {
  const response = await fetch(`http://localhost:4000/api/${endpoint}`, { headers: { cookie: session } });
  const body = await response.json();
  console.log(endpoint, response.status, Array.isArray(body) ? body.length : JSON.stringify(body.counts || body));
}

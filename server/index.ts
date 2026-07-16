import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { db } from './src/db';

const app = new Hono();

app.get('/', (c) => c.text('MindEase API is running'));

app.get('/health/db', async (c) => {
    try {
        await db.execute('select 1');
        return c.json({ db: 'connected' });
    } catch (err) {
        return c.json({ db: 'error', message: String(err) }, 500);
    }
});

serve({ fetch: app.fetch, port: 3000 }, (info) => {
    console.log(`Server running on http://localhost:${info.port}`);
});
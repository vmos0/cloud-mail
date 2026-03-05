import app from '../hono/hono';
import result from '../model/result';
import publicService from '../service/public-service';

app.post('/public/genToken', async (c) => {
	const data = await publicService.genToken(c, await c.req.json());
	return c.json(result.ok(data));
});

app.post('/public/emailList', async (c) => {
	const list = await publicService.emailList(c, await c.req.json());
	return c.json(result.ok(list));
});

app.post('/public/addUser', async (c) => {
	await publicService.addUser(c, await c.req.json());
	return c.json(result.ok());
});

app.post('/public/formSubmit', async (c) => {
	let params = {};
	const contentType = c.req.header('content-type') || '';
	if (contentType.includes('application/json')) {
		params = await c.req.json();
	}
	const data = await publicService.formSubmit(c, params);
	return c.json(result.ok(data));
});

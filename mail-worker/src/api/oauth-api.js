import app from '../hono/hono';
import result from "../model/result";
import oauthService from "../service/oauth-service";

// 处理第三方账号登录
app.post('/oauth/:provider/login', async (c) => {
    const provider = c.req.param('provider');

    const loginFns = {
        linuxdo: oauthService.linuxdoLogin,
        github: oauthService.githubLogin,
        gitlab: oauthService.gitlabLogin,
        google: oauthService.googleLogin,
    };

    const loginFn = loginFns[provider];

    if (!loginFn) {
        return c.json(result.fail('Unsupported OAuth provider', 400));
    }

    const loginInfo = await loginFn.call(oauthService, c, await c.req.json());
    return c.json(result.ok(loginInfo));
});

// 处理第三方账号 OAuth回调（GET请求）
app.get('/oauth/:provider/login', async (c) => {
	// 从URL参数中获取code
	const code = c.req.query('code');
	// 重定向到前端登录页面，带上code参数
	const origin = new URL(c.req.url).origin;
	return c.redirect(`${origin}/login?code=${code}&state=${c.req.param('provider')}`, 302);
});

// 处理第三方绑定
app.put('/oauth/bindUser', async (c) => {
	const loginInfo = await oauthService.bindUser(c, await c.req.json());
	return c.json(result.ok(loginInfo))
})

// 处理第三方账号解绑
app.delete('/oauth/unbind/:provider', async (c) => {
	const provider = c.req.param('provider');
	const userContext = c.get('userContext');
	await oauthService.unbind(c, userContext.userId, provider);
	return c.json(result.ok())
})

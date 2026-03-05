import settingService from './setting-service';
import jwtUtils from '../utils/jwt-utils';
import domainUtils from "../utils/domain-uitls";

const feishuService = {

	async sendEmailToBot(c, email) {

		let logs = [];
		const log = (msg) => logs.push(`${new Date().toISOString()} - ${msg}`);

		try {
			log('fetch setting');
			const setting = await settingService.query(c);
			const { feishuBotStatus, feishuAppId, feishuAppSecret, feishuChatId, customDomain } = setting;
			log(`status: ${feishuBotStatus}, appId: ${feishuAppId}, chat: ${feishuChatId}`);

			if (feishuBotStatus !== 0 || !feishuAppId || !feishuAppSecret || !feishuChatId) {
				log('early return (status/params check failed)');
				await c.env.kv.put('FEISHU_DEBUG_LOG', logs.join('\n'));
				return;
			}

			log('generate jwt');
			const jwtToken = await jwtUtils.generateToken(c, { emailId: email.emailId });
			const webAppUrl = customDomain ? `${domainUtils.toOssDomain(customDomain)}/api/telegram/getEmail/${jwtToken}` : 'https://www.cloudflare.com/404';
			
			log('fetch tenant_access_token');
			const tokenRes = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ app_id: feishuAppId, app_secret: feishuAppSecret })
			});
			
			const tokenData = await tokenRes.json();
			if (tokenData.code !== 0) {
				log(`Token fail: ${JSON.stringify(tokenData)}`);
				await c.env.kv.put('FEISHU_DEBUG_LOG', logs.join('\n'));
				return;
			}
			const accessToken = tokenData.tenant_access_token;
			log('got token');
			
			const postContent = {
				zh_cn: {
					title: "📩 收到新邮件",
					content: [
						[{ tag: "text", text: `主题: ${email.subject || '无主题'}` }],
						[{ tag: "text", text: `发件人: ${email.name || ''} <${email.sendEmail}>` }],
						[{ tag: "text", text: `收件人: ${email.toName || ''} <${email.toEmail}>` }],
						[{ tag: "text", text: `\n预览:\n${email.text ? email.text.substring(0, 200) : '无文本内容可用。'}\n\n` }],
						[{ tag: "a", href: webAppUrl, text: "👉 查看完整邮件" }]
					]
				}
			};

			log('send msg API');
			const msgRes = await fetch('https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${accessToken}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					receive_id: feishuChatId,
					msg_type: "post",
					content: JSON.stringify(postContent)
				})
			});

			if (!msgRes.ok) {
				log(`Msg HTTP FAIL: ${msgRes.status} -> ${await msgRes.text()}`);
			} else {
				const msgData = await msgRes.json();
				if (msgData.code !== 0) {
					log(`Msg API fail: ${JSON.stringify(msgData)}`);
				} else {
					log('Msg SUCCESS!');
				}
			}
		} catch (e) {
			log(`EXCEPTION: ${e.message} ${e.stack}`);
		}

		await c.env.kv.put('FEISHU_DEBUG_LOG', logs.join('\n'));
	}

}

export default feishuService;

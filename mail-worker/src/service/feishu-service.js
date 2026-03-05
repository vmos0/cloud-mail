import settingService from './setting-service';
import jwtUtils from '../utils/jwt-utils';
import domainUtils from "../utils/domain-uitls";
import emailUtils from '../utils/email-utils';

const feishuService = {

	async sendEmailToBot(c, email) {

		try {
			const setting = await settingService.query(c);
			const { 
				feishuBotStatus, feishuAppId, feishuAppSecret, feishuChatId, 
				feishuMsgFrom, feishuMsgTo, feishuMsgText, customDomain 
			} = setting;

			if (feishuBotStatus !== 0 || !feishuAppId || !feishuAppSecret || !feishuChatId) {
				return;
			}

			const jwtToken = await jwtUtils.generateToken(c, { emailId: email.emailId });

			let reqOrigin = '';
			try {
				const urlObj = new URL(c.req.url);
				reqOrigin = urlObj.origin;
			} catch (e) {}

			const baseDomain = customDomain ? domainUtils.toOssDomain(customDomain) : reqOrigin;
			const webAppUrl = baseDomain ? `${baseDomain}/api/telegram/getEmail/${jwtToken}` : '';
			
			const tokenRes = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ app_id: feishuAppId, app_secret: feishuAppSecret })
			});
			
			const tokenData = await tokenRes.json();
			if (tokenData.code !== 0) {
				console.error(`获取飞书 Token 失败: ${JSON.stringify(tokenData)}`);
				return;
			}
			const accessToken = tokenData.tenant_access_token;
			
			const contentArray = [];
			
			contentArray.push([{ tag: "text", text: `主题: ${email.subject || '无主题'}` }]);
			
			if (feishuMsgFrom === 'only-name') {
				contentArray.push([{ tag: "text", text: `发件人: ${email.name || ''}` }]);
			} else if (feishuMsgFrom === 'show') {
				contentArray.push([{ tag: "text", text: `发件人: ${email.name || ''} <${email.sendEmail}>` }]);
			}

			if (feishuMsgTo === 'show') {
				contentArray.push([{ tag: "text", text: `收件人: ${email.toName || ''} <${email.toEmail}>` }]);
			}

			if (feishuMsgText === 'show') {
				const textRaw = email.text || email.content || '';
				const text = (emailUtils.formatText(textRaw) || emailUtils.htmlToText(textRaw))
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;');
				contentArray.push([{ tag: "text", text: `\n\n${text ? text.substring(0, 200) : '无文本内容可用。'}\n\n` }]);
			}

			if (webAppUrl) {
				contentArray.push([{ tag: "a", href: webAppUrl, text: "👉 查看完整邮件" }]);
			}

			const postContent = {
				zh_cn: {
					title: "📩 收到新邮件",
					content: contentArray
				}
			};

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
				console.error(`转发 Feishu 失败 status: ${msgRes.status} response: ${await msgRes.text()}`);
			} else {
				const msgData = await msgRes.json();
				if (msgData.code !== 0) {
					console.error(`转发 Feishu API 错误: ${JSON.stringify(msgData)}`);
				}
			}
		} catch (e) {
			console.error(`转发 Feishu 异常: ${e.message} ${e.stack}`);
		}
	}

}

export default feishuService;

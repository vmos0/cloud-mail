import settingService from './setting-service';
import jwtUtils from '../utils/jwt-utils';
import domainUtils from "../utils/domain-uitls";
import emailMsgTemplate from '../template/email-msg';

const feishuService = {

	async sendEmailToBot(c, email) {

		const setting = await settingService.query(c);
		const { feishuBotStatus, feishuWebhook, customDomain, tgMsgTo, tgMsgFrom, tgMsgText } = setting;

		if (feishuBotStatus !== 0 || !feishuWebhook) {
			return;
		}

		const jwtToken = await jwtUtils.generateToken(c, { emailId: email.emailId })

		const webAppUrl = customDomain ? `${domainUtils.toOssDomain(customDomain)}/api/telegram/getEmail/${jwtToken}` : 'https://www.cloudflare.com/404'
		
		// Use the same text template logic as telegram for simplicity or customize to markdown
		const textContent = emailMsgTemplate(email, tgMsgTo, tgMsgFrom, tgMsgText);

		// Remove HTML tags for Feishu simple text, or we can use Feishu's interactive message card
		// Using an interactive card is better:
		
		const cardMessage = {
			msg_type: "interactive",
			card: {
				header: {
					template: "blue",
					title: {
						content: "收到新邮件",
						tag: "plain_text"
					}
				},
				elements: [
					{
						tag: "markdown",
						content: `**Subject:** ${email.subject}\n**From:** ${email.name || ''} <${email.sendEmail}>\n**To:** ${email.toName || ''} <${email.toEmail}>\n\n**Preview:**\n${email.text ? email.text.substring(0, 200) : 'No plain text content available.'}` 
					},
					{
						tag: "action",
						actions: [
							{
								tag: "button",
								text: {
									content: "查看完整邮件",
									tag: "plain_text"
								},
								url: webAppUrl,
								type: "primary"
							}
						]
					}
				]
			}
		};

		try {
			// Include sign logic if feishuSecret is provided (Optional, skip for now. The requirement was basic webhook)
			// let signResult = {};
			// if (feishuSecret) { ... }
			
			const res = await fetch(feishuWebhook, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(cardMessage)
			});
			if (!res.ok) {
				console.error(`转发 Feishu 失败 status: ${res.status} response: ${await res.text()}`);
			}
		} catch (e) {
			console.error(`转发 Feishu 失败:`, e.message);
		}
	}

}

export default feishuService;

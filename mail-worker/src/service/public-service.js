import BizError from '../error/biz-error';
import orm from '../entity/orm';
import { v4 as uuidv4 } from 'uuid';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import saltHashUtils from '../utils/crypto-utils';
import cryptoUtils from '../utils/crypto-utils';
import emailUtils from '../utils/email-utils';
import roleService from './role-service';
import verifyUtils from '../utils/verify-utils';
import { t } from '../i18n/i18n';
import reqUtils from '../utils/req-utils';
import dayjs from 'dayjs';
import email from '../entity/email';
import userService from './user-service';
import KvConst from '../const/kv-const';
import { isDel, roleConst, emailConst, settingConst } from '../const/entity-const';
import emailService from './email-service';
import accountService from './account-service';
import settingService from './setting-service';
import telegramService from './telegram-service';
import feishuService from './feishu-service';

const publicService = {

	async emailList(c, params) {

		let { toEmail, content, subject, sendName, sendEmail, timeSort, num, size, type , isDel } = params

		const query = orm(c).select({
				emailId: email.emailId,
				sendEmail: email.sendEmail,
				sendName: email.name,
				subject: email.subject,
				toEmail: email.toEmail,
				toName: email.toName,
				type: email.type,
				createTime: email.createTime,
				content: email.content,
				text: email.text,
				isDel: email.isDel,
		}).from(email)

		if (!size) {
			size = 20
		}

		if (!num) {
			num = 1
		}

		size = Number(size);
		num = Number(num);

		num = (num - 1) * size;

		let conditions = []

		if (toEmail) {
			conditions.push(sql`${email.toEmail} COLLATE NOCASE LIKE ${toEmail}`)
		}

		if (sendEmail) {
			conditions.push(sql`${email.sendEmail} COLLATE NOCASE LIKE ${sendEmail}`)
		}

		if (sendName) {
			conditions.push(sql`${email.name} COLLATE NOCASE LIKE ${sendName}`)
		}

		if (subject) {
			conditions.push(sql`${email.subject} COLLATE NOCASE LIKE ${subject}`)
		}

		if (content) {
			conditions.push(sql`${email.content} COLLATE NOCASE LIKE ${content}`)
		}

		if (type || type === 0) {
			conditions.push(eq(email.type, type))
		}

		if (isDel || isDel === 0) {
			conditions.push(eq(email.isDel, isDel))
		}

		if (conditions.length === 1) {
			query.where(...conditions)
		} else if (conditions.length > 1) {
			query.where(and(...conditions))
		}

		if (timeSort === 'asc') {
			query.orderBy(asc(email.emailId));
		} else {
			query.orderBy(desc(email.emailId));
		}

		return query.limit(size).offset(num);

	},

	async addUser(c, params) {
		const { list } = params;

		if (list.length === 0) return;

		for (const emailRow of list) {
			if (!verifyUtils.isEmail(emailRow.email)) {
				throw new BizError(t('notEmail'));
			}

			if (!c.env.domain.includes(emailUtils.getDomain(emailRow.email))) {
				throw new BizError(t('notEmailDomain'));
			}

			const { salt, hash } = await saltHashUtils.hashPassword(
				emailRow.password || cryptoUtils.genRandomPwd()
			);

			emailRow.salt = salt;
			emailRow.hash = hash;
		}


		const activeIp = reqUtils.getIp(c);
		const { os, browser, device } = reqUtils.getUserAgent(c);
		const activeTime = dayjs().format('YYYY-MM-DD HH:mm:ss');

		const roleList = await roleService.roleSelectUse(c);
		const defRole = roleList.find(roleRow => roleRow.isDefault === roleConst.isDefault.OPEN);

		const userList = [];

		for (const emailRow of list) {
			let { email, hash, salt, roleName } = emailRow;
			let type = defRole.roleId;

			if (roleName) {
				const roleRow = roleList.find(role => role.name === roleName);
				type = roleRow ? roleRow.roleId : type;
			}

			const userSql = `INSERT INTO user (email, password, salt, type, os, browser, active_ip, create_ip, device, active_time, create_time)
			VALUES ('${email}', '${hash}', '${salt}', '${type}', '${os}', '${browser}', '${activeIp}', '${activeIp}', '${device}', '${activeTime}', '${activeTime}')`

			const accountSql = `INSERT INTO account (email, name, user_id)
			VALUES ('${email}', '${emailUtils.getName(email)}', 0);`;

			userList.push(c.env.db.prepare(userSql));
			userList.push(c.env.db.prepare(accountSql));

		}

		userList.push(c.env.db.prepare(`UPDATE account SET user_id = (SELECT user_id FROM user WHERE user.email = account.email) WHERE user_id = 0;`))

		try {
			await c.env.db.batch(userList);
		} catch (e) {
			if(e.message.includes('SQLITE_CONSTRAINT')) {
				throw new BizError(t('emailExistDatabase'))
			} else {
				throw e
			}
		}

	},

	async genToken(c, params) {

		await this.verifyUser(c, params)

		const uuid = uuidv4();

		await c.env.kv.put(KvConst.PUBLIC_KEY, uuid);

		return {token: uuid}
	},

	async formSubmit(c, params) {

		let type, siteOrigin, fromEmail, fromName, toEmail, fields = {};
		const files = [];

		const contentType = c.req.header('content-type') || '';
		
		if (contentType.includes('multipart/form-data')) {
			const formData = await c.req.formData();
			type = formData.get('type');
			siteOrigin = formData.get('siteOrigin');
			fromEmail = formData.get('fromEmail');
			fromName = formData.get('fromName');
			toEmail = formData.get('toEmail');
			
			const fieldsStr = formData.get('fields');
			if (fieldsStr) {
				try {
					fields = JSON.parse(fieldsStr);
				} catch (e) {
					throw new BizError('Invalid fields JSON format');
				}
			}

			for (const [key, value] of formData.entries()) {
				if (value instanceof File) {
					files.push(value);
				}
			}
		} else {
			// application/json
			({ type, siteOrigin, fromEmail, fromName, toEmail, fields } = params);
		}

		// validate required fields
		if (!type || !fromEmail || !toEmail) {
			throw new BizError('Missing required fields: type, fromEmail, toEmail');
		}

		if (!['subscribe', 'quote'].includes(type)) {
			throw new BizError('Invalid type, must be "subscribe" or "quote"');
		}

		if (type === 'quote' && (!fields || Object.keys(fields).length === 0)) {
			throw new BizError('Missing required field: fields (required for quote type)');
		}

		// lookup recipient account
		const accountRow = await accountService.selectByEmailIncludeDel(c, toEmail);
		if (!accountRow) {
			throw new BizError(`Recipient account not found: ${toEmail}`);
		}

		// extract site hostname for display
		let siteHost = siteOrigin;
		try {
			siteHost = new URL(siteOrigin).hostname;
		} catch (e) {}

		// generate subject
		const displayName = fromName || fromEmail;
		const subject = type === 'subscribe'
			? `[Subscribe] ${fromEmail} from ${siteHost || 'website'}`
			: `[Quote Request] ${displayName} from ${siteHost || 'website'}`;

		// format fields as HTML
		const icon = type === 'subscribe' ? '📧' : '📋';
		const title = type === 'subscribe' ? 'New Subscription' : 'Quote Request';

		const fieldsHtml = Object.entries(fields || {})
			.map(([key, value]) => {
				const label = key.charAt(0).toUpperCase() + key.slice(1);
				const val = String(value || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
				return `<tr><td style="padding:6px 12px;font-weight:bold;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:6px 12px;">${val}</td></tr>`;
			}).join('\n');

		const content = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;">
<h2 style="margin-top:0;">${icon} ${title}</h2>
<p><strong>From:</strong> ${(fromName || '').replace(/</g, '&lt;')} &lt;${fromEmail}&gt;</p>
<p><strong>Site:</strong> ${siteHost || 'N/A'}</p>
<p><strong>Type:</strong> ${type}</p>
<hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0;">
<table style="border-collapse:collapse;width:100%;">
${fieldsHtml}
</table>
</div>`;

		const text = `${title}\nFrom: ${displayName} <${fromEmail}>\nSite: ${siteHost || 'N/A'}\n\n` +
			Object.entries(fields || {}).map(([k, v]) => `${k}: ${v}`).join('\n');

		// build email record
		const emailData = {
			toEmail: toEmail,
			toName: emailUtils.getName(toEmail),
			sendEmail: fromEmail,
			name: fromName || emailUtils.getName(fromEmail),
			subject: subject,
			content: content,
			text: text,
			cc: '[]',
			bcc: '[]',
			recipient: JSON.stringify([{ address: toEmail, name: '' }]),
			inReplyTo: '',
			relation: '',
			messageId: '',
			userId: accountRow.userId,
			accountId: accountRow.accountId,
			isDel: 0,
			status: emailConst.status.SAVING
		};

		// insert email record
		let emailRow = await emailService.receive(c, emailData, [], '');

		// process attachments if any
		if (files.length > 0) {
			const attachments = [];
			for (const file of files) {
				const arrayBuffer = await file.arrayBuffer();
				const ext = file.name.substring(file.name.lastIndexOf('.'));
				// We need constant and fileUtils here, but they might not be imported.
				// Let's use crypto to generate consistent hashes instead.
				const hashBuffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
				const hashArray = Array.from(new Uint8Array(hashBuffer));
				const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
				const key = `attachment/${hashHex}${ext}`;

				attachments.push({
					filename: file.name,
					mimeType: file.type || 'application/octet-stream',
					content: arrayBuffer,
					size: file.size,
					key: key,
					contentId: '',
					emailId: emailRow.emailId,
					userId: emailRow.userId,
					accountId: emailRow.accountId
				});
			}

			const attStore = await import('./att-service.js');
			await attStore.default.addAtt(c, attachments);
		}

		// complete receive
		const result = await emailService.completeReceive(c, emailConst.status.RECEIVE, emailRow.emailId);

		// trigger notifications
		try {
			const { tgBotStatus, tgChatId } = await settingService.query(c);
			if (tgBotStatus === settingConst.tgBotStatus.OPEN && tgChatId) {
				await telegramService.sendEmailToBot(c, result);
			}
			await feishuService.sendEmailToBot(c, result);
		} catch (e) {
			console.error('Form submit notification error:', e);
		}

		return { emailId: result.emailId };
	},

	async verifyUser(c, params) {

		const { email, password } = params

		const userRow = await userService.selectByEmailIncludeDel(c, email);

		if (email !== c.env.admin) {
			throw new BizError(t('notAdmin'));
		}

		if (!userRow || userRow.isDel === isDel.DELETE) {
			throw new BizError(t('notExistUser'));
		}

		if (!await cryptoUtils.verifyPassword(password, userRow.salt, userRow.password)) {
			throw new BizError(t('IncorrectPwd'));
		}
	}

}

export default publicService

import KvConst from '../const/kv-const';
import setting from '../entity/setting';
import orm from '../entity/orm';
import {settingConst, verifyRecordType} from '../const/entity-const';
import fileUtils from '../utils/file-utils';
import r2Service from './r2-service';
import constant from '../const/constant';
import BizError from '../error/biz-error';
import {t} from '../i18n/i18n'
import verifyRecordService from './verify-record-service';
import userContext from '../security/user-context';

const settingService = {

	async ensureAnonymousReceiveColumns(c) {
		const statements = [
			`ALTER TABLE setting ADD COLUMN anonymous_receive INTEGER NOT NULL DEFAULT 0;`,
			`ALTER TABLE setting ADD COLUMN anonymous_receive_count INTEGER NOT NULL DEFAULT 10;`,
			`ALTER TABLE setting ADD COLUMN anonymous_receive_days INTEGER NOT NULL DEFAULT 0;`,
			`ALTER TABLE setting ADD COLUMN anonymous_receive_refresh INTEGER NOT NULL DEFAULT 10;`,
			`ALTER TABLE setting ADD COLUMN anonymous_receive_blacklist TEXT NOT NULL DEFAULT '';`,
			`ALTER TABLE setting ADD COLUMN anonymous_receive_registered_user INTEGER NOT NULL DEFAULT 0;`,
			`ALTER TABLE setting ADD COLUMN anonymous_receive_domains TEXT NOT NULL DEFAULT '';`
		];

		for (const sql of statements) {
			try {
				await c.env.db.prepare(sql).run();
			} catch (e) {
				if (!/duplicate column name|already exists/i.test(e.message || '')) {
					throw e;
				}
			}
		}
	},

	normalize(settingRow) {
		if (!settingRow) {
			return settingRow;
		}
		settingRow.anonymousReceive = settingRow.anonymousReceive ?? settingConst.anonymousReceive.OPEN;
		settingRow.anonymousReceiveCount = settingRow.anonymousReceiveCount ?? 10;
		settingRow.anonymousReceiveDays = settingRow.anonymousReceiveDays ?? 0;
		settingRow.anonymousReceiveRefresh = settingRow.anonymousReceiveRefresh ?? 10;
		settingRow.anonymousReceiveBlacklist = settingRow.anonymousReceiveBlacklist ?? '';
		settingRow.anonymousReceiveRegisteredUser = settingRow.anonymousReceiveRegisteredUser ?? settingConst.anonymousReceive.OPEN;
		settingRow.anonymousReceiveDomains = settingRow.anonymousReceiveDomains ?? '';
		return settingRow;
	},

	async refresh(c) {
		let settingRow;
		try {
			settingRow = await orm(c).select().from(setting).get();
		} catch (e) {
			if (!/anonymous_receive/i.test(e.message || '')) {
				throw e;
			}
			await this.ensureAnonymousReceiveColumns(c);
			settingRow = await orm(c).select().from(setting).get();
		}
		settingRow.resendTokens = JSON.parse(settingRow.resendTokens);
		settingRow.brevoTokens = JSON.parse(settingRow.brevoTokens || '{}');

		const normalized = this.normalize(settingRow);

		// 兼容不同 Hono 版本
		if (typeof c.set === 'function') {
			c.set('setting', normalized);
		} else {
			c.setting = normalized;
		}

		await c.env.kv.put(KvConst.SETTING, JSON.stringify(normalized));
	},

	async query(c) {
		// 尝试从 context 获取设置，兼容不同 Hono 版本
		let settingData = null;

		// 尝试使用 c.get 方法
		if (typeof c.get === 'function') {
			settingData = c.get('setting');
		}
		// 尝试使用 c.setting 直接访问
		if (!settingData && c.setting) {
			settingData = c.setting;
		}

		if (settingData) {
			return this.normalize(settingData);
		}

		const setting = this.normalize(await c.env.kv.get(KvConst.SETTING, { type: 'json' }));

		if (!setting) {
			throw new BizError('数据库未初始化 Database not initialized.');
		}

		let domainList = c.env.domain;

		if (typeof domainList === 'string') {
			try {
				domainList = JSON.parse(domainList)
			} catch (error) {
				throw new BizError(t('notJsonDomain'));
			}
		}

		if (!c.env.domain) {
			throw new BizError(t('noDomainVariable'));
		}

		domainList = domainList.map(item => '@' + item);
		setting.domainList = domainList;

		let projectLink = c.env.project_link;
		if (typeof projectLink === 'string' && projectLink === 'false') {
			projectLink = false
		} else if (projectLink === false) {
			projectLink = false
		} else {
			projectLink = true
		}

		setting.projectLink = projectLink;

		setting.emailPrefixFilter = setting.emailPrefixFilter.split(",").filter(Boolean);

		if (typeof c.set === 'function') {
		        c.set('setting', setting);
		} else {
		        c.setting = setting;
		}

		return setting;
	},

	async get(c, showSiteKey = false) {

		const [settingRow, recordList] = await Promise.all([
			await this.query(c),
			verifyRecordService.selectListByIP(c)
		]);


		if (!showSiteKey) {
			settingRow.siteKey = settingRow.siteKey ? `${settingRow.siteKey.slice(0, 6)}******` : null;
		}

		settingRow.secretKey = settingRow.secretKey ? `${settingRow.secretKey.slice(0, 6)}******` : null;

		Object.keys(settingRow.resendTokens).forEach(key => {
			settingRow.resendTokens[key] = `${settingRow.resendTokens[key].slice(0, 12)}******`;
		});

		Object.keys(settingRow.brevoTokens).forEach(key => {
			settingRow.brevoTokens[key] = `${settingRow.brevoTokens[key].slice(0, 12)}******`;
		});

		settingRow.feishuAppSecret = settingRow.feishuAppSecret ? `${settingRow.feishuAppSecret.slice(0, 12)}******` : null;

		settingRow.s3AccessKey = settingRow.s3AccessKey ? `${settingRow.s3AccessKey.slice(0, 12)}******` : null;
		settingRow.s3SecretKey = settingRow.s3SecretKey ? `${settingRow.s3SecretKey.slice(0, 12)}******` : null;
		settingRow.tgBotToken = settingRow.tgBotToken ? `${settingRow.tgBotToken.slice(0, 20)}******` : null;
		settingRow.hasR2 = !!c.env.r2
		settingRow.hasCfEmail = !!c.env.email

		let regVerifyOpen = false
		let addVerifyOpen = false

		recordList.forEach(row => {
			if (row.type === verifyRecordType.REG) {
				regVerifyOpen = row.count >= settingRow.regVerifyCount
			}
			if (row.type === verifyRecordType.ADD) {
				addVerifyOpen = row.count >= settingRow.addVerifyCount
			}
		})

		settingRow.regVerifyOpen = regVerifyOpen
		settingRow.addVerifyOpen = addVerifyOpen

		settingRow.storageType = await r2Service.storageType(c);

		return settingRow;
	},

	async set(c, params) {
		if (
			params.anonymousReceive !== undefined ||
			params.anonymousReceiveCount !== undefined ||
			params.anonymousReceiveDays !== undefined ||
			params.anonymousReceiveRefresh !== undefined ||
			params.anonymousReceiveBlacklist !== undefined ||
			params.anonymousReceiveRegisteredUser !== undefined ||
			params.anonymousReceiveDomains !== undefined
		) {
			await this.ensureAnonymousReceiveColumns(c);
		}

		const settingData = await this.query(c);
		let resendTokens = { ...settingData.resendTokens, ...params.resendTokens };
		Object.keys(resendTokens).forEach(domain => {
			if (!resendTokens[domain]) delete resendTokens[domain];
		});

		let brevoTokens = { ...settingData.brevoTokens, ...params.brevoTokens };
		Object.keys(brevoTokens).forEach(domain => {
			if (!brevoTokens[domain]) delete brevoTokens[domain];
		});

		if (Array.isArray(params.emailPrefixFilter)) {
			params.emailPrefixFilter = params.emailPrefixFilter + '';
		}

		if (Array.isArray(params.aiCodeFilter)) {
			params.aiCodeFilter = params.aiCodeFilter + '';
		}

		if (params.anonymousReceiveCount !== undefined) {
			const count = Number(params.anonymousReceiveCount);
			params.anonymousReceiveCount = count === -1 ? -1 : Math.min(Math.max(Number.isNaN(count) ? 10 : count, 0), 50);
		}

		if (params.anonymousReceiveDays !== undefined) {
			const days = Number(params.anonymousReceiveDays);
			params.anonymousReceiveDays = Math.min(Math.max(Number.isNaN(days) ? 0 : days, 0), 365);
		}

		if (params.anonymousReceiveBlacklist !== undefined) {
			params.anonymousReceiveBlacklist = Array.isArray(params.anonymousReceiveBlacklist)
				? params.anonymousReceiveBlacklist + ''
				: String(params.anonymousReceiveBlacklist);
		}

		if (params.anonymousReceiveDomains !== undefined) {
			params.anonymousReceiveDomains = Array.isArray(params.anonymousReceiveDomains)
				? params.anonymousReceiveDomains + ''
				: String(params.anonymousReceiveDomains);
		}

		params.resendTokens = JSON.stringify(resendTokens);
		params.brevoTokens = JSON.stringify(brevoTokens);

		await orm(c).update(setting).set({ ...params }).returning().get();
		if (params.anonymousReceiveCount !== undefined) {
			await c.env.db
				.prepare('UPDATE setting SET anonymous_receive_count = ?')
				.bind(params.anonymousReceiveCount)
				.run();
		}
		if (params.anonymousReceiveDays !== undefined) {
			await c.env.db
				.prepare('UPDATE setting SET anonymous_receive_days = ?')
				.bind(params.anonymousReceiveDays)
				.run();
		}
		if (params.anonymousReceiveBlacklist !== undefined) {
			await c.env.db
				.prepare('UPDATE setting SET anonymous_receive_blacklist = ?')
				.bind(params.anonymousReceiveBlacklist)
				.run();
		}
		await this.refresh(c);
	},

	async deleteBackground(c) {

		const { background } = await this.query(c);
		if (!background) return

		if (background.startsWith('http')) {
			await orm(c).update(setting).set({ background: '' }).run();
			await this.refresh(c)
			return;
		}

		if (background) {
			await r2Service.delete(c,background)
			await orm(c).update(setting).set({ background: '' }).run();
			await this.refresh(c)
		}
	},

	async setBackground(c, params) {

		let { background } = params

		await this.deleteBackground(c);

		if (background && !background.startsWith('http')) {

			const file = fileUtils.base64ToFile(background)

			const arrayBuffer = await file.arrayBuffer();
			background = constant.BACKGROUND_PREFIX + await fileUtils.getBuffHash(arrayBuffer) + fileUtils.getExtFileName(file.name);


			await r2Service.putObj(c, background, arrayBuffer, {
				contentType: file.type,
				cacheControl: `public, max-age=31536000, immutable`,
				contentDisposition: `inline; filename="${file.name}"`
			});

		}

		await orm(c).update(setting).set({ background }).run();
		await this.refresh(c);
		return background;
	},

	async setBlacklist(c, params) {
		const { blackSubject, blackContent, blackFrom  } = params
		await orm(c).update(setting).set({ blackSubject, blackContent, blackFrom }).run();
		await this.refresh(c);
		return this.get(c);
	},

	async websiteConfig(c) {

		const settingRow = await this.get(c, true);
		const token = await userContext.getToken(c);

		return {
			register: settingRow.register,
			title: settingRow.title,
			manyEmail: settingRow.manyEmail,
			addEmail: settingRow.addEmail,
			autoRefresh: settingRow.autoRefresh,
			anonymousReceive: settingRow.anonymousReceive,
			anonymousReceiveCount: settingRow.anonymousReceiveCount,
			anonymousReceiveDays: settingRow.anonymousReceiveDays,
			anonymousReceiveRefresh: settingRow.anonymousReceiveRefresh,
			anonymousReceiveRegisteredUser: settingRow.anonymousReceiveRegisteredUser,
			anonymousReceiveDomains: settingRow.anonymousReceiveDomains
				? settingRow.anonymousReceiveDomains.split(',').filter(Boolean).map(item => item.startsWith('@') ? item : `@${item}`)
				: settingRow.domainList,
			addEmailVerify: settingRow.addEmailVerify,
			registerVerify: settingRow.registerVerify,
			send: settingRow.send,
			r2Domain: settingRow.r2Domain,
			siteKey: settingRow.siteKey,
			background: settingRow.background,
			loginOpacity: settingRow.loginOpacity,
			domainList: settingRow.loginDomain === 1 && !token ? [] : settingRow.domainList,
			regKey: settingRow.regKey,
			regVerifyOpen: settingRow.regVerifyOpen,
			addVerifyOpen: settingRow.addVerifyOpen,
			noticeTitle: settingRow.noticeTitle,
			noticeContent: settingRow.noticeContent,
			noticeType: settingRow.noticeType,
			noticeDuration: settingRow.noticeDuration,
			noticePosition: settingRow.noticePosition,
			noticeWidth: settingRow.noticeWidth,
			noticeOffset: settingRow.noticeOffset,
			notice: settingRow.notice,
			loginDomain: settingRow.loginDomain,
			linuxdoClientId: settingRow.linuxdoClientId,
			linuxdoSwitch: settingRow.linuxdoSwitch,
			githubClientId: settingRow.githubClientId,
			githubSwitch: settingRow.githubSwitch,
			gitlabClientId: settingRow.gitlabClientId,
			gitlabCallbackUrl: settingRow.gitlabCallbackUrl,
			gitlabSwitch: settingRow.gitlabSwitch,
			googleClientId: settingRow.googleClientId,
			googleCallbackUrl: settingRow.googleCallbackUrl,
			googleSwitch: settingRow.googleSwitch,
			emailProvider: settingRow.emailProvider,
			minEmailPrefix: settingRow.minEmailPrefix,
			projectLink: settingRow.projectLink
		};
	},
};

export default settingService;

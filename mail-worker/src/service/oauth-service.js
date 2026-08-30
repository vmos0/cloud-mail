import BizError from "../error/biz-error";
import orm from "../entity/orm";
import {oauth} from "../entity/oauth";
import { eq, inArray, and } from 'drizzle-orm';
import userService from "./user-service";
import loginService from "./login-service";
import cryptoUtils from "../utils/crypto-utils";
import settingService from "./setting-service";
import {t} from '../i18n/i18n';

const oauthService = {

	async bindUser(c, params) {

		const { email, oauthUserId, code, platform } = params;
		const oauthRow = await this.getById(c, oauthUserId, platform);

		let userRow = await userService.selectByIdIncludeDel(c, oauthRow.userId);

		if (userRow) {
			throw new BizError('用户已绑定有邮箱')
		}

		// 检查邮箱是否已存在
		let existingUser = await userService.selectByEmailIncludeDel(c, email);

		if (existingUser) {
			// 邮箱已存在，直接绑定
			if (existingUser.isDel === 1) {
				throw new BizError('该邮箱已被删除')
			}
			userRow = existingUser;
		} else {
			// 邮箱不存在，注册新用户
			await loginService.register(c, { email, password: cryptoUtils.genRandomPwd(), code }, true);
			userRow = await userService.selectByEmail(c, email);
		}

		await orm(c).update(oauth).set({ userId: userRow.userId }).where(and(eq(oauth.oauthUserId, oauthUserId), eq(oauth.platform, platform))).run();
		const jwtToken = await loginService.login(c, { email, password: null }, true);

		return { userInfo: oauthRow, token: jwtToken}
	},

	async linuxdoLogin(c, params) {

		const { code, redirectUri } = params;

		const setting = await settingService.query(c);
		this.assertEnabled(setting, 'linuxdoSwitch');

		const reqParams = new URLSearchParams()
		reqParams.append('client_id', setting.linuxdoClientId)
		reqParams.append('client_secret', setting.linuxdoClientSecret)
		reqParams.append('code', code)
		reqParams.append('redirect_uri', redirectUri)
		reqParams.append('grant_type', 'authorization_code')

		const tokenRes = await fetch("https://connect.linux.do/oauth2/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: reqParams.toString()
		})

		if (!tokenRes.ok) {
			throw new BizError(tokenRes.statusText)
		}

		const token = await tokenRes.json()

		const userRes = await fetch('https://connect.linux.do/api/user', {
			headers: {
				Authorization: 'Bearer ' + token.access_token
			}
		});

		if (!userRes.ok) {
			throw new BizError(userRes.statusText)
		}

		const userInfo = await userRes.json();

		userInfo.oauthUserId = String(userInfo.id);
		userInfo.active = userInfo.active ? 0 : 1;
		userInfo.silenced = userInfo.silenced ? 0 : 1;
		userInfo.trustLevel = userInfo.trust_level;
		userInfo.avatar = userInfo.avatar_url;
		userInfo.platform = 'linuxdo';

		return await this.saveAndLogin(c, userInfo)
	},

	async githubLogin(c, params) {

		const { code, redirectUri } = params;

		const setting = await settingService.query(c);
		this.assertEnabled(setting, 'githubSwitch');

		const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json"
			},
			body: JSON.stringify({
				client_id: setting.githubClientId,
				client_secret: setting.githubClientSecret,
				code: code,
				redirect_uri: redirectUri
			})
		});

		if (!tokenRes.ok) {
			throw new BizError(tokenRes.statusText);
		}

		const token = await tokenRes.json();

		if (token.error) {
			throw new BizError(token.error_description || token.error);
		}

		const userRes = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: 'Bearer ' + token.access_token,
				'User-Agent': 'cloud-mail'
			}
		});

		if (!userRes.ok) {
			throw new BizError(userRes.statusText);
		}

		const userInfo = await userRes.json();

		userInfo.oauthUserId = String(userInfo.id);
		userInfo.username = userInfo.login;
		userInfo.avatar = userInfo.avatar_url;
		userInfo.platform = 'github';

		return await this.saveAndLogin(c, userInfo);
	},

	async googleLogin(c, params) {

		const { code, redirectUri } = params;

		const setting = await settingService.query(c);
		this.assertEnabled(setting, 'googleSwitch');

		const reqParams = new URLSearchParams()
		reqParams.append('client_id', setting.googleClientId)
		reqParams.append('client_secret', setting.googleClientSecret)
		reqParams.append('code', code)
		reqParams.append('redirect_uri', redirectUri)
		reqParams.append('grant_type', 'authorization_code')

		const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: reqParams.toString()
		});

		if (!tokenRes.ok) {
			throw new BizError(tokenRes.statusText);
		}

		const token = await tokenRes.json();

		const userRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: {
				Authorization: 'Bearer ' + token.access_token
			}
		});

		if (!userRes.ok) {
			throw new BizError(userRes.statusText);
		}

		const userInfo = await userRes.json();

		userInfo.oauthUserId = String(userInfo.sub);
		userInfo.username = userInfo.email;
		userInfo.name = userInfo.name;
		userInfo.avatar = userInfo.picture;
		userInfo.platform = 'google';

		return await this.saveAndLogin(c, userInfo);
	},

	async gitlabLogin(c, params) {

		const { code } = params;

		const setting = await settingService.query(c);
		this.assertEnabled(setting, 'gitlabSwitch');

		const reqParams = new URLSearchParams()
		reqParams.append('client_id', setting.gitlabClientId)
		reqParams.append('client_secret', setting.gitlabClientSecret)
		reqParams.append('code', code)
		reqParams.append('redirect_uri', setting.gitlabCallbackUrl)
		reqParams.append('grant_type', 'authorization_code')

		const tokenRes = await fetch("https://gitlab.com/oauth/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: reqParams.toString()
		});

		if (!tokenRes.ok) {
			throw new BizError(tokenRes.statusText);
		}

		const token = await tokenRes.json();

		const userRes = await fetch('https://gitlab.com/api/v4/user', {
			headers: {
				Authorization: 'Bearer ' + token.access_token
			}
		});

		if (!userRes.ok) {
			throw new BizError(userRes.statusText);
		}

		const userInfo = await userRes.json();

		userInfo.oauthUserId = String(userInfo.id);
		userInfo.username = userInfo.username;
		userInfo.name = userInfo.name;
		userInfo.avatar = userInfo.avatar_url;
		userInfo.platform = 'gitlab';

		return await this.saveAndLogin(c, userInfo);
	},

	async saveAndLogin(c, userInfo) {

		const oauthRow = await this.saveUser(c, userInfo);
		let userRow = await userService.selectByIdIncludeDel(c, oauthRow.userId);

		// 如果没有找到用户，尝试查找是否有其他用户绑定了该账户
		if (!userRow || oauthRow.userId === 0) {
			// 检查是否有用户已经绑定了该账户
			const existingBinding = await userService.selectByOauthUserId(c, userInfo.oauthUserId, userInfo.platform);
			if (existingBinding) {
				userRow = existingBinding;
				// 更新OAuth记录的userId
				await orm(c).update(oauth).set({ userId: userRow.userId }).where(eq(oauth.oauthId, oauthRow.oauthId)).run();
			}
		}

		if (!userRow) {
		// 自动生成默认邮箱地址
		const defaultEmail = `${userInfo.username}@${c.env.domain[0]}`;
		// 检查邮箱是否已存在
		let isEmailAvailable = false;
		let emailSuggestions = [];

		try {
			const existingUser = await userService.selectByEmailIncludeDel(c, defaultEmail);
			isEmailAvailable = !existingUser;
		} catch (error) {
			isEmailAvailable = false;
		}

		if (!isEmailAvailable) {
			// 生成3-5个备选邮箱建议
			emailSuggestions = await this.generateEmailSuggestions(c, userInfo.username);
		}

		// 返回OAuth信息和邮箱建议
		return {
			userInfo: oauthRow,
			token: null,
			defaultEmail,
			isEmailAvailable,
			emailSuggestions,
			provider: userInfo.platform
		};
	}

		const JwtToken = await loginService.login(c, { email: userRow.email, password: null }, true);
		return { userInfo: oauthRow, token: JwtToken };
	},

	async saveUser(c, userInfo) {

		const userInfoRow = await this.getById(c, userInfo.oauthUserId, userInfo.platform);

		if (!userInfoRow) {
			return await orm(c).insert(oauth).values(userInfo).returning().get();
		} else {
			return await orm(c).update(oauth).set(userInfo).where(and(eq(oauth.oauthUserId, userInfo.oauthUserId), eq(oauth.platform, userInfo.platform))).returning().get();
		}

	},

	// 生成邮箱建议
	async generateEmailSuggestions(c, username) {
		const suggestions = [];
		const domains = c.env.domain;
		const suffixes = ['a', 'b', 'c', '2025', '123'];

		// 尝试生成5个建议
		for (let i = 0; i < suffixes.length; i++) {
			const suffix = suffixes[i];
			const email = `${username}${suffix}@${domains[0]}`;

			try {
				const existingUser = await userService.selectByEmailIncludeDel(c, email);
				if (!existingUser) {
					suggestions.push(email);
				}
			} catch (error) {
				// 邮箱不存在，可用
				suggestions.push(email);
			}

			// 生成3个建议后停止
			if (suggestions.length >= 3) {
				break;
			}
		}

		// 如果生成的建议不足3个，再尝试其他组合
		if (suggestions.length < 3) {
			for (let i = 0; i < 10; i++) {
				const randomSuffix = Math.floor(Math.random() * 1000);
				const email = `${username}${randomSuffix}@${domains[0]}`;

				try {
					const existingUser = await userService.selectByEmailIncludeDel(c, email);
					if (!existingUser) {
						suggestions.push(email);
					}
				} catch (error) {
					// 邮箱不存在，可用
					suggestions.push(email);
				}

				if (suggestions.length >= 3) {
					break;
				}
			}
		}

		return suggestions;
	},

	assertEnabled(setting, switchKey) {
		if (setting[switchKey] !== 0) {
			throw new BizError(t('oauthDisabled'));
		}
	},

	async getById(c, oauthUserId, platform) {
		return await orm(c).select().from(oauth).where(and(eq(oauth.oauthUserId, oauthUserId), eq(oauth.platform, platform))).get();
	},

	async deleteByUserId(c, userId) {
		await this.deleteByUserIds(c, [userId]);
	},

	async deleteByUserIds(c, userIds) {
		await orm(c).delete(oauth).where(inArray(oauth.userId, userIds)).run();
	},

	//定时任务凌晨清除未绑定邮箱的oauth用户
	async clearNoBindOathUser(c) {
		await orm(c).delete(oauth).where(eq(oauth.userId, 0)).run();
	},

async unbind(c, userId, provider) {
    await orm(c).delete(oauth).where(
        and(
            eq(oauth.userId, userId),
            eq(oauth.platform, provider)
        )
    ).run();
},
}

export default  oauthService

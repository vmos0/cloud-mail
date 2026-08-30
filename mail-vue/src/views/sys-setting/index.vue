<template>
  <div class="settings-container">
    <div class="loading" :class="firstLoading ? 'loading-show' : 'loading-hide'">
      <loading/>
    </div>
    <el-scrollbar class="scroll" v-if="!firstLoading">
      <div class="scroll-body">
        <div class="card-grid">
          <!-- Basic Settings Card -->
          <div class="settings-card">
            <div class="card-title">{{ $t('websiteSetting') }}</div>
            <div class="card-content">
              <div class="setting-item">
                <div><span>{{ $t('websiteReg') }}</span></div>
                <div>
                  <el-switch @change="changeField('aiCode', $event)" :before-change="beforeChange" :active-value="0" :inactive-value="1"
                             v-model="setting.register"/>
                </div>
              </div>
              <div class="setting-item">
                <div><span>{{ $t('loginDomain') }}</span></div>
                <div>
                  <el-switch @change="change" :before-change="beforeChange" :active-value="1" :inactive-value="0"
                             v-model="setting.loginDomain"/>
                </div>
              </div>
              <div class="setting-item">
                <div><span>{{ $t('regKey') }}</span></div>
                <div>
                  <el-select
                      @change="change"
                      :style="`width: ${ locale === 'en' ?  100 : 80 }px;`"
                      v-model="setting.regKey"
                      :placeholder="$t('select')"
                  >
                    <el-option
                        v-for="item in regKeyOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                  </el-select>
                </div>
              </div>
              <div class="setting-item">
                <div><span>{{ $t('addAccount') }}</span></div>
                <div>
                  <el-switch @change="change" :before-change="beforeChange" :active-value="0" :inactive-value="1"
                             v-model="setting.addEmail"/>
                </div>
              </div>
              <div class="setting-item">
                <div>
                  <span>{{ $t('multipleEmail') }}</span>
                  <el-tooltip effect="dark" :content="$t('multipleEmailDesc')">
                    <Icon class="warning" icon="fe:warning" width="18" height="18"/>
                  </el-tooltip>
                </div>
                <div>
                  <el-switch @change="change" :before-change="beforeChange" :active-value="0" :inactive-value="1"
                             v-model="setting.manyEmail"/>
                </div>
              </div>
              <div class="setting-item">
                <div>
                  <span>{{ $t('syncDelete') }}</span>
                  <el-tooltip effect="dark" :content="$t('syncDeleteDesc')">
                    <Icon class="warning" icon="fe:warning" width="18" height="18"/>
                  </el-tooltip>
                </div>
                <div>
                  <el-switch @change="change" :before-change="beforeChange" :active-value="0" :inactive-value="1"
                             v-model="setting.syncDelete"/>
                </div>
              </div>
              <div class="setting-item">
                <div>
                  <span>{{ $t('emailPrefix') }}</span>
                </div>
                <div class="forward">
                  <el-button class="opt-button" size="small" type="primary" @click="openEmailPrefix">
                    <Icon icon="fluent:settings-48-regular" width="18" height="18"/>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Personalization Settings Card -->
          <div class="settings-card">
            <div class="card-title">{{ $t('customization') }}</div>
            <div class="card-content">
              <div class="setting-item">
                <div class="title-item"><span>{{ $t('websiteTitle') }}</span></div>
                <div class="email-title">
                  <span>{{ setting.title }}</span>
                  <el-button class="opt-button" size="small" type="primary" @click="editTitleShow = true">
                    <Icon icon="lsicon:edit-outline" width="16" height="16"/>
                  </el-button>
                </div>
              </div>
              <div class="setting-item">
                <div class="title-item"><span>{{ $t('loginBoxOpacity') }}</span></div>
                <div>
                  <el-input-number size="small" v-model="loginOpacity" @change="opacityChange" :precision="2"
                                   :step="0.01" :max="1" :min="0"/>
                </div>
              </div>
              <div class="setting-item personalized">
                <div><span>{{ $t('loginBackground') }}</span></div>
                <div>
                  <el-image
                      class="background"
                      :src="cvtR2Url(setting.background)"
                      :preview-src-list="[cvtR2Url(setting.background)]"
                      show-progress
                      fit="cover"
                  >
                    <template #error>
                      <div class="error-image">
                        <Icon icon="ph:image" width="24" height="24"/>
                      </div>
                    </template>
                  </el-image>
                  <div class="background-btn">
                    <el-button class="opt-button" size="small" type="primary" @click="openSetBackground">
                      <Icon icon="lsicon:edit-outline" width="16" height="16"/>
                    </el-button>
                    <el-button class="opt-button" size="small" type="primary" @click="delBackground">
                      <Icon icon="material-symbols:delete-outline-rounded" width="16" height="16"/>
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Email Sending Settings Card -->
          <div class="settings-card">
            <div class="card-title">{{ $t('emailSetting') }}</div>
            <div class="card-content">
              <div class="setting-item">
                <div><span>{{ $t('receiveEmail') }}</span></div>
                <div>
                  <el-switch @change="change" :before-change="beforeChange" :active-value="0" :inactive-value="1"
                             v-model="setting.receive"/>
                </div>
              </div>
              <div class="setting-item">
                <div>
                  <span>{{ $t('autoRefresh') }}</span>
                  <el-tooltip effect="dark" :content="$t('autoRefreshDesc')">
                    <Icon class="warning" icon="fe:warning" width="18" height="18"/>
                  </el-tooltip>
                </div>
                <div>
                  <el-select
                      @change="change"
                      :style="`width: ${ locale === 'en' ? 100 : 80 }px;`"
                      v-model="setting.autoRefresh"
                      :placeholder="$t('select')"
                  >
                    <el-option
                        v-for="item in authRefreshOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                  </el-select>
                </div>
              </div>
              <div class="setting-item">
                <div><span>{{ $t('sendEmail') }}</span></div>
                <div>
                  <el-switch @change="change" :before-change="beforeChange" :active-value="0" :inactive-value="1"
                             v-model="setting.send"/>
                </div>
              </div>
              <div class="setting-item">
                <div>
                  <span>{{ $t('noRecipientTitle') }}</span>
                  <el-tooltip effect="dark" :content="$t('noRecipientDesc')">
                    <Icon class="warning" icon="fe:warning" width="18" height="18"/>
                  </el-tooltip>
                </div>
                <div>
                  <el-switch @change="change" :before-change="beforeChange" :active-value="0" :inactive-value="1"
                             v-model="setting.noRecipient"/>
                </div>
              </div>
              <div class="setting-item">
                <div><span>{{ setting.hasCfEmail ? $t('cloudflareEmailSending') : $t('resendToken') }}</span></div>
                <div v-if="setting.hasCfEmail">
                  <span>{{ $t('enabled') }}</span>
                </div>
                <div v-else>
                  <el-button class="opt-button" style="margin-top: 0" @click="openResendList" size="small"
                             type="primary">
                    <Icon icon="ic:round-list" width="18" height="18"/>
                  </el-button>
                  <el-button class="opt-button" style="margin-top: 0" @click="openResendForm" size="small"
                             type="primary">
                    <Icon icon="material-symbols:add-rounded" width="16" height="16"/>
                  </el-button>
                </div>
              </div>
              <div class="setting-item">
                <div><span>Brevo Token</span></div>
                <div>
                  <el-button class="opt-button" style="margin-top: 0" @click="openBrevoList" size="small"
                             type="primary">
                    <Icon icon="ic:round-list" width="18" height="18"/>
                  </el-button>
                  <el-button class="opt-button" style="margin-top: 0" @click="openBrevoForm" size="small"
                             type="primary">
                    <Icon icon="material-symbols:add-rounded" width="16" height="16"/>
                  </el-button>
                </div>
              </div>
              <div class="setting-item">
                <div><span>{{ $t('blackList') }}</span></div>
                <div>
                  <el-button class="opt-button" style="margin-top: 0" @click="openBlackListForm" size="small"
                             type="primary">
                    <Icon icon="fluent:settings-48-regular" width="16" height="16"/>
                  </el-button>
                </div>
              </div>
              <div class="setting-item">
                <div>
                  <span>{{ $t('emailProvider') }}</span>
                  <el-tooltip effect="dark" :content="$t('emailProviderDesc')">
                    <Icon class="warning" icon="fe:warning" width="18" height="18"/>
                  </el-tooltip>
                </div>
                <div>
                  <el-select
                      @change="change"
                      style="width: 120px;"
                      v-model="setting.emailProvider"
                      :placeholder="$t('select')"
                  >
                    <el-option label="Resend" value="resend"/>
                    <el-option label="Brevo" value="brevo"/>
                  </el-select>
                </div>
              </div>
            </div>
          </div>

          <!-- Anonymous Inbox Settings Card -->
          <div class="settings-card">
            <div class="card-title">{{ $t('anonymousReceive') }}</div>
            <div class="card-content">
              <div class="setting-item">
                <div>
                  <span>{{ $t('anonymousReceive') }}</span>
                  <el-tooltip effect="dark" :content="$t('anonymousReceiveDesc')">
                    <Icon class="warning" icon="fe:warning" width="18" height="18"/>
                  </el-tooltip>
                </div>
                <div>
                  <el-switch @change="change" :before-change="beforeChange" :active-value="0" :inactive-value="1"
                             v-model="setting.anonymousReceive"/>
                </div>
              </div>
              <div class="setting-item">
                <div>
                  <span>{{ $t('anonymousReceiveCount') }}</span>
                  <el-tooltip effect="dark" :content="$t('anonymousReceiveCountDesc')">
                    <Icon class="warning" icon="fe:warning" width="18" height="18"/>
                  </el-tooltip>
                </div>
                <div>
                  <el-input-number
                      v-model="anonymousReceiveCount"
                      :min="-1"
                      :max="50"
                      size="small"
                      @change="saveAnonymousReceiveCount"
                  />
                </div>
              </div>
              <div class="setting-item">
                <div>
                  <span>{{ $t('anonymousReceiveDays') }}</span>
                  <el-tooltip effect="dark" :content="$t('anonymousReceiveDaysDesc')">
                    <Icon class="warning" icon="fe:warning" width="18" height="18"/>
                  </el-tooltip>
                </div>
                <div>
                  <el-input-number
                      v-model="anonymousReceiveDays"
                      :min="0"
                      :max="365"
                      size="small"
                      @change="saveAnonymousReceiveDays"
                  />
                </div>
              </div>
              <div class="setting-item">
                <div>
                  <span>{{ $t('anonymousReceiveRegisteredUser') }}</span>
                  <el-tooltip effect="dark" :content="$t('anonymousReceiveRegisteredUserDesc')">
                    <Icon class="warning" icon="fe:warning" width="18" height="18"/>
                  </el-tooltip>
                </div>
                <div>
                  <el-switch @change="change" :before-change="beforeChange" :active-value="0" :inactive-value="1"
                             v-model="setting.anonymousReceiveRegisteredUser"/>
                </div>
              </div>
              <div class="setting-item">
                <div>
                  <span>{{ $t('anonymousReceiveRefresh') }}</span>
                  <el-tooltip effect="dark" :content="$t('anonymousReceiveRefreshDesc')">
                    <Icon class="warning" icon="fe:warning" width="18" height="18"/>
                  </el-tooltip>
                </div>
                <div>
                  <el-select
                      @change="change"
                      :style="`width: ${ locale === 'en' ? 100 : 80 }px;`"
                      v-model="setting.anonymousReceiveRefresh"
                      placeholder="Select"
                  >
                    <el-option
                        v-for="item in authRefreshOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                  </el-select>
                </div>
              </div>
              <div class="setting-item">
                <div>
                  <span>{{ $t('anonymousReceiveDomains') }}</span>
                  <el-tooltip effect="dark" :content="$t('anonymousReceiveDomainsDesc')">
                    <Icon class="warning" icon="fe:warning" width="18" height="18"/>
                  </el-tooltip>
                </div>
                <div>
                  <el-select
                      v-model="anonymousReceiveDomains"
                      multiple
                      collapse-tags
                      collapse-tags-tooltip
                      size="small"
                      style="width: 220px"
                      :placeholder="$t('select')"
                      @change="saveAnonymousReceiveDomains"
                  >
                    <el-option
                        v-for="item in anonymousReceiveDomainOptions"
                        :key="item"
                        :label="item"
                        :value="item"
                    />
                  </el-select>
                </div>
              </div>
                <div class="setting-item">
                  <div>
                    <span>{{ $t('anonymousReceiveBlacklist') }}</span>
                    <el-tooltip effect="dark" :content="$t('anonymousReceiveBlacklistDesc')">
                      <Icon class="warning" icon="fe:warning" width="18" height="18"/>
                    </el-tooltip>
                  </div>
                  <div class="forward">
                    <el-button class="opt-button" style="margin-top: 0" @click="openAnonymousReceiveBlacklist" size="small"
                               type="primary">
                      <Icon icon="fluent:settings-48-regular" width="16" height="16"/>
                    </el-button>
                  </div>
                </div>

                <div class="setting-item">
                  <div>
                    <span>{{ $t('autoClean') }}</span>
                    <el-tooltip effect="dark" :content="$t('autoCleanDesc')">
                      <Icon class="warning" icon="fe:warning" width="18" height="18"/>
                    </el-tooltip>
                  </div>
                  <div class="forward">
                    <span>{{ setting.autoCleanDays > 0 ? $t('autoCleanRetain', { days: setting.autoCleanDays }) : $t('disabled') }}</span>
                    <el-button class="opt-button" style="margin-top: 0" @click="openAutoClean" size="small"
                               type="primary">
                      <Icon icon="fluent:settings-48-regular" width="16" height="16"/>
                    </el-button>
                  </div>
                </div>
            </div>
          </div>

          <!-- Object Storage Card -->
          <div class="settings-card">
            <div class="card-title">{{ $t('oss') }}</div>
            <div class="card-content">
              <div class="r2domain-item">
                <div>
                  <span>{{ $t('osDomain') }}</span>
                  <el-tooltip effect="dark" :content="$t('ossDomainDesc')">
                    <Icon class="warning" icon="fe:warning" width="18" height="18"/>
                  </el-tooltip>
                </div>
                <div class="r2domain">
                  <span>{{ setting.r2Domain || '' }}</span>
                  <el-button class="opt-button" size="small" type="primary" @click="r2DomainShow = true">
                    <Icon icon="lsicon:edit-outline" width="16" height="16"/>
                  </el-button>
                </div>
              </div>
              <div class="setting-item">
                <div>
                  <span>{{ $t('s3Configuration') }}</span>
                </div>
                <div class="r2domain">
                  <el-button class="opt-button" size="small" type="primary" @click="addS3Show = true">
                    <Icon icon="fluent:settings-48-regular" width="16" height="16"/>
                  </el-button>
                </div>
              </div>
              <div class="setting-item">
                <div>
                  <span>{{ $t('storageType') }}</span>
                </div>
                <div class="r2domain">
                  <div class="storage-type">
                    <el-tag>{{ setting.storageType }}</el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- R2 Storage Setting Card -->
          <div class="settings-card">
            <div class="card-title">{{ $t('r2StorageSetting') }}</div>
            <div class="card-content">
              <div class="setting-item">
                <div>
                  <span>{{ $t('r2MaxSize') }}</span>
                  <el-tooltip effect="dark" :content="$t('r2MaxSizeDesc')">
                    <Icon class="warning" icon="fe:warning" width="18" height="18"/>
                  </el-tooltip>
                </div>
                <div>
                  <el-input-number
                    v-model="r2MaxSize"
                    @change="r2MaxSizeChange"
                    :min="0"
                    :max="1000"
                    :precision="0"
                    style="width: 150px"
                  >
                    <template #suffix>
                      <span>{{ $t('gbUnit') }}</span>
                    </template>
                  </el-input-number>
                </div>
              </div>
              <div class="setting-item">
                <div>
                  <span>{{ $t('r2FileExpireDays') }}</span>
                  <el-tooltip effect="dark" :content="$t('r2FileExpireDaysDesc')">
                    <Icon class="warning" icon="fe:warning" width="18" height="18"/>
                  </el-tooltip>
                </div>
                <div>
                  <el-input-number
                    v-model="r2FileExpireDays"
                    @change="r2FileExpireDaysChange"
                    :min="0"
                    :max="365"
                    :precision="0"
                    style="width: 150px"
                  >
                    <template #suffix>
                      <span>{{ $t('dayUnit') }}</span>
                    </template>
                  </el-input-number>
                </div>
              </div>
            </div>
          </div>

          <div class="settings-card">
            <div class="card-title">{{ $t('emailPush') }}</div>
            <div class="card-content">
              <div class="setting-item">
                <div><span>{{ $t('tgBot') }}</span></div>
                <div class="forward">
                  <span>{{ setting.tgBotStatus === 0 ? $t('enabled') : $t('disabled') }}</span>
                  <el-button class="opt-button" size="small" type="primary" @click="openTgSetting">
                    <Icon icon="fluent:settings-48-regular" width="18" height="18"/>
                  </el-button>
                </div>
              </div>
              <div class="setting-item">
                <div><span>{{ $t('otherEmail') }}</span></div>
                <div class="forward">
                  <span>{{ setting.forwardStatus === 0 ? $t('enabled') : $t('disabled') }}</span>
                  <el-button class="opt-button" size="small" type="primary" @click="openThirdEmailSetting">
                    <Icon icon="fluent:settings-48-regular" width="18" height="18"/>
                  </el-button>
                </div>
              </div>
              <div class="setting-item">
                <div><span>{{ $t('feishuPush') }}</span></div>
                <div class="forward">
                  <span>{{ setting.feishuBotStatus === 0 ? $t('enabled') : $t('disabled') }}</span>
                  <el-button class="opt-button" size="small" type="primary" @click="openFeishuSetting">
                    <Icon icon="fluent:settings-48-regular" width="18" height="18"/>
                  </el-button>
                </div>
              </div>
              <div class="setting-item">
                <div><span>{{ $t('forwardingRules') }}</span></div>
                <div class="forward">
                  <span>{{ setting.ruleType === 0 ? $t('forwardAll') : $t('rules') }}</span>
                  <el-button class="opt-button" size="small" type="primary" @click="openForwardRules">
                    <Icon icon="fluent:settings-48-regular" width="18" height="18"/>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Turnstile Verification Card -->
          <div class="settings-card">
            <div class="card-title">{{ $t('turnstileSetting') }}</div>
            <div class="card-content">
              <div class="setting-item">
                <div><span>{{ $t('signUpVerification') }}</span></div>
                <div>
                  <el-button class="opt-button" size="small" type="primary" @click="openRegVerifyCount">
                    <Icon icon="fluent:settings-48-regular" width="18" height="18"/>
                  </el-button>
                  <el-select
                      @change="change"
                      :style="`width: ${ locale === 'en' ? 100 : 80 }px;`"
                      v-model="setting.registerVerify"
                      :placeholder="$t('select')"
                      class="bot-verify-select"
                  >
                    <el-option key="1" :value="0" :label="$t('enable')"/>
                    <el-option key="1" :value="1" :label="$t('disable')"/>
                    <el-option key="1" :value="2" :label="$t('rulesVerify')"/>
                  </el-select>
                </div>
              </div>
              <div class="setting-item">
                <div><span>{{ $t('addEmailVerification') }}</span></div>
                <div>
                  <el-button class="opt-button" size="small" type="primary" @click="openAddVerifyCount">
                    <Icon icon="fluent:settings-48-regular" width="18" height="18"/>
                  </el-button>
                  <el-select
                      @change="change"
                      :style="`width: ${ locale === 'en' ? 100 : 80 }px;`"
                      v-model="setting.addEmailVerify"
                      :placeholder="$t('select')"
                      class="bot-verify-select"
                  >
                    <el-option key="1" :value="0" :label="$t('enable')"/>
                    <el-option key="1" :value="1" :label="$t('disable')"/>
                    <el-option key="1" :value="2" :label="$t('rulesVerify')"/>
                  </el-select>
                </div>
              </div>
              <div class="setting-item">
                <div><span>Site Key</span></div>
                <div class="bot-verify">
                  <span>{{ setting.siteKey }}</span>
                  <el-button class="opt-button" size="small" type="primary" @click="turnstileShow = true">
                    <Icon icon="lsicon:edit-outline" width="16" height="16"/>
                  </el-button>
                </div>
              </div>
              <div class="setting-item">
                <div><span>Secret Key</span></div>
                <div class="bot-verify">
                  <span> {{ setting.secretKey }} </span>
                  <el-button class="opt-button" size="small" type="primary" @click="turnstileShow = true">
                    <Icon icon="lsicon:edit-outline" width="16" height="16"/>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Log Settings Card -->
          <div class="settings-card">
            <div class="card-title">{{ $t('logSetting') }}</div>
            <div class="card-content">
              <div class="setting-item">
                <div><span>{{ $t('showDetailedLog') }}</span></div>
                <div>
                  <el-switch @change="logLevelChange" :active-value="0" :inactive-value="1"
                             v-model="detailedLog"/>
                </div>
              </div>
              <div class="setting-item">
                <div><span>{{ $t('viewLog') }}</span></div>
                <div>
                  <el-button class="opt-button" size="small" type="primary" @click="openLogViewer">
                    <Icon icon="material-symbols:view-list-rounded" width="18" height="18"/>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <div class="settings-card">
            <div class="card-title">{{ $t('noticeTitle') }}</div>
            <div class="card-content">
              <div class="setting-item">
                <div><span>{{ $t('noticePopup') }}</span></div>
                <div class="forward">
                  <span>{{ setting.notice === 0 ? $t('enabled') : $t('disabled') }}</span>
                  <el-button class="opt-button" size="small" type="primary" @click="openNoticePopupSetting">
                    <Icon icon="fluent:settings-48-regular" width="18" height="18"/>
                  </el-button>
                </div>
              </div>
              <div class="setting-item">
                <div><span>{{ $t('popUp') }}</span></div>
                <div class="forward">
                  <el-button class="opt-button" size="small" type="primary" @click="openNoticePopup">
                    <Icon icon="mynaui:click-solid" width="18" height="18"/>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <div class="settings-card">
            <div class="card-title">Workers AI</div>
            <div class="card-content">
              <div class="setting-item">
                <div><span>{{ $t('codeRecognition') }}</span></div>
                <div>
                  <el-switch @change="change" :before-change="beforeChange" :active-value="0" :inactive-value="1"
                             v-model="setting.aiCode"/>
                </div>
              </div>
              <div class="setting-item">
                <div><span>{{ $t('codeRecognitionRules') }}</span></div>
                <div class="forward">
                  <el-button class="opt-button" size="small" type="primary" @click="openAiCodeFilter">
                    <Icon icon="fluent:settings-48-regular" width="18" height="18"/>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- OAuth Login Card -->
          <div class="settings-card">
            <div class="card-title">{{ $t('oauthLogin') }}</div>
            <div class="card-content">
              <div class="setting-item" v-for="p in oauthPlatforms" :key="p.key">
                <div>
                  <el-avatar v-if="p.iconType === 'image'" :src="p.icon" :size="22" class="oauth-icon"/>
                  <Icon v-else :icon="p.icon" width="22" height="22" class="oauth-icon"/>
                  <span>{{ p.label }}</span>
                </div>
                <div class="forward">
                  <span>{{ setting[p.key + 'Switch'] === 0 ? $t('enabled') : $t('disabled') }}</span>
                  <el-button class="opt-button" size="small" type="primary" @click="openOauthSetting(p)">
                    <Icon icon="fluent:settings-48-regular" width="18" height="18"/>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <div class="settings-card about">
            <div class="card-title">{{ $t('about') }}</div>
            <div class="card-content">
              <div class="concerning-item">
                <span>{{ $t('help') }} : </span>
                <el-button @click="jump('https://doc.skymail.ink')">
                  {{ t('document') }}
                  <template #icon>
                    <Icon color="#79D6B5" icon="fluent-color:document-32" width="18" height="18"/>
                  </template>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dialogs remain the same -->
      <el-dialog v-model="editTitleShow" :title="$t('changeTitle')" width="340" @closed="editTitle = setting.title">
        <form @submit.prevent>
          <el-input type="text" :placeholder="$t('websiteTitle')" v-model="editTitle" @keyup.enter="saveTitle"/>
          <el-button type="primary" :loading="settingLoading" @click="saveTitle">{{ $t('save') }}</el-button>
        </form>
      </el-dialog>
      <el-dialog v-model="resendTokenFormShow" :title="$t('resendToken')" width="340" @closed="cleanResendTokenForm">
        <form @submit.prevent>
          <el-select style="margin-bottom: 15px" v-model="resendTokenForm.domain" :placeholder="$t('select')">
            <el-option
                v-for="item in settingStore.domainList"
                :key="item"
                :label="item"
                :value="item"
            />
          </el-select>
          <el-input type="text" :placeholder="$t('addResendTokenDesc')" v-model="resendTokenForm.token" @keyup.enter="saveResendToken"/>
          <el-button type="primary" :loading="settingLoading" @click="saveResendToken">{{ $t('save') }}</el-button>
        </form>
      </el-dialog>
      <el-dialog v-model="brevoTokenFormShow" title="Brevo Token" width="340" @closed="cleanBrevoTokenForm">
        <form>
          <el-select style="margin-bottom: 15px" v-model="brevoTokenForm.domain" :placeholder="$t('select')">
            <el-option
                v-for="item in settingStore.domainList"
                :key="item"
                :label="item"
                :value="item"
            />
          </el-select>
          <el-input type="text" :placeholder="$t('brevoApiKeyPlaceholder')" v-model="brevoTokenForm.token"/>
          <el-button type="primary" :loading="settingLoading" @click="saveBrevoToken">{{ $t('save') }}</el-button>
        </form>
      </el-dialog>
      <el-dialog v-model="r2DomainShow" :title="$t('addOsDomain')" width="340"
                 @closed="r2DomainInput = setting.r2Domain">
        <form @submit.prevent>
          <el-input type="text" :placeholder="$t('domainDesc')" v-model="r2DomainInput" @keyup.enter="saveR2domain"/>
          <el-button type="primary" :loading="settingLoading" @click="saveR2domain">{{ $t('save') }}</el-button>
        </form>
      </el-dialog>
      <el-dialog v-model="turnstileShow" :title="$t('addTurnstileSecret')" width="340"
                 @closed="turnstileForm.secretKey = '';turnstileForm.siteKey = ''">
        <form @submit.prevent>
          <el-input type="text" placeholder="Site Key" v-model="turnstileForm.siteKey" @keyup.enter="saveTurnstileKey"/>
          <el-input type="text" style="margin-top: 15px" placeholder="Secret Key" v-model="turnstileForm.secretKey" @keyup.enter="saveTurnstileKey"/>
          <el-button type="primary" :loading="settingLoading" @click="saveTurnstileKey">{{ $t('save') }}</el-button>
        </form>
      </el-dialog>
      <el-dialog v-model="oauthSettingShow" :title="$t('oauthSetting') + ' - ' + oauthForm.label" width="340"
@closed="oauthForm.clientId = ''; oauthForm.clientSecret = ''; oauthForm.switch = 1">
        <div class="dialog-content">
          <el-input type="text" :placeholder="$t('clientId')" v-model="oauthForm.clientId"/>
          <el-input type="text" style="margin-top: 15px" :placeholder="$t('clientSecret')" v-model="oauthForm.clientSecret"/>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-switch v-model="oauthForm.switch" :active-value="0" :inactive-value="1" :active-text="$t('enable')"
                       :inactive-text="$t('disable')"/>
            <el-button type="primary" :loading="settingLoading" @click="saveOauth">{{ $t('save') }}</el-button>
          </div>
        </template>
      </el-dialog>
      <el-dialog
          v-model="showSetBackground"
          class="cut-dialog"
          @closed="closedSetBackground"
      >
        <template #header>
          <span style="font-size: 18px">
            {{ $t('backgroundTitle') }}
            <el-tooltip>
              <template #content>
                <span>{{ $t('backgroundWarning') }}</span>
              </template>
              <Icon class="title-icon  warning" icon="fe:warning" width="18" height="18"/>
            </el-tooltip>
          </span>
        </template>
        <el-input :placeholder="$t('backgroundUrlDesc')" v-model="backgroundUrl" v-if="!localUpShow"
                  class="background-url" @keyup.enter="saveBackground"/>
        <el-image
            v-if="localUpShow"
            :preview-src-list="[backgroundImage]"
            show-progress
            class="cropper"
            fit="cover"
            :src="backgroundImage"
        ></el-image>
        <div class="cut-button">
          <el-button type="primary" link @click="openCut" v-if="!localUpShow">
            {{ $t('localUpload') }}
          </el-button>
          <el-button type="primary" link @click="localUpShow = false" v-if="localUpShow">
            {{ $t('imageLink') }}
          </el-button>
          <el-button type="primary" :loading="settingLoading" @click="saveBackground">{{ $t('save') }}</el-button>
        </div>
      </el-dialog>
      <el-dialog
          v-model="tgSettingShow"
          class="forward-dialog"
      >
        <template #header>
          <div class="forward-head">
            <span class="forward-set-title">{{ $t('tgBot') }}</span>
            <el-tooltip effect="dark" :content="$t('tgBotDesc')">
              <Icon class="warning" icon="fe:warning" width="18" height="18"/>
            </el-tooltip>
          </div>
        </template>
        <div class="forward-set-body">
          <el-input :placeholder="setting.tgBotToken || $t('tgBotToken')" v-model="tgBotToken" @keyup.enter="tgBotSave"></el-input>
          <el-input-tag tag-type="warning" :placeholder="$t('toBotTokenDesc')" v-model="tgChatId"
                        @add-tag="addChatTag"></el-input-tag>
          <el-input tag-type="warning" :placeholder="$t('customDomainDesc')" v-model="customDomain" @keyup.enter="tgBotSave"></el-input>
          <div class="tg-msg-label">
            <span>{{t('from')}}</span>
            <el-select  v-model="tgMsgFrom" >
              <el-option
                  v-for="item in tgMsgFromOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </div>
          <div class="tg-msg-label">
            <span>{{t('recipient')}}</span>
            <el-select  v-model="tgMsgTo" >
              <el-option
                  v-for="item in tgMsgToOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </div>
          <div class="tg-msg-label">
            <span>{{t('emailText')}}</span>
            <el-select  v-model="tgMsgText" >
              <el-option
                  v-for="item in tgMsgTextOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </div>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-switch v-model="tgBotStatus" :active-value="0" :inactive-value="1" :active-text="$t('enable')"
                       :inactive-text="$t('disable')"/>
            <el-button :loading="settingLoading" type="primary" @click="tgBotSave">
              {{ $t('save') }}
            </el-button>
          </div>
        </template>
      </el-dialog>
      <el-dialog
          v-model="feishuSettingShow"
          class="forward-dialog feishu-dialog"
      >
        <template #header>
          <div class="forward-head">
            <span class="forward-set-title">{{ $t('feishuPush') }}</span>
            <el-tooltip effect="dark" :content="$t('feishuPushDesc')">
              <Icon class="warning" icon="fe:warning" width="18" height="18"/>
            </el-tooltip>
          </div>
        </template>
        <div class="forward-set-body">
          <div class="feishu-section-title">{{ $t('basicConfig') }}</div>
          <el-input :placeholder="$t('appId')" v-model="feishuAppId"></el-input>
          <el-input type="password" :placeholder="$t('appSecret')" v-model="feishuAppSecret"></el-input>

          <div class="feishu-config-row">
            <span class="feishu-label">{{ $t('receiveType') }}</span>
            <el-select v-model="feishuReceiveType" style="width: 100%;">
              <el-option :label="`🏠 ${t('groupChat')}`" :value="0"/>
              <el-option :label="`👤 ${t('personal')}`" :value="1"/>
            </el-select>
          </div>

          <el-input-tag v-if="feishuReceiveType === 0" tag-type="warning" :placeholder="$t('feishuChatIdPlaceholder')" v-model="feishuChatId"></el-input-tag>
          <el-input-tag v-else tag-type="success" :placeholder="$t('feishuOpenIdPlaceholder')" v-model="feishuOpenId"></el-input-tag>

          <div class="feishu-section-title">{{ $t('msgStyleConfig') }}</div>
          <div class="feishu-config-row">
            <span class="feishu-label">{{ $t('headerTemplate') }}</span>
            <el-select v-model="feishuHeaderTemplate" style="width: 100%;">
              <el-option :label="`🔵 ${t('blue')}`" value="blue"/>
              <el-option :label="`🟣 ${t('purple')}`" value="purple"/>
              <el-option :label="`🟡 ${t('yellow')}`" value="yellow"/>
              <el-option :label="`🟢 ${t('green')}`" value="green"/>
              <el-option :label="`🔴 ${t('red')}`" value="red"/>
              <el-option :label="`⚪ ${t('white')}`" value="white"/>
              <el-option :label="`⚫ ${t('noHeader')}`" value="none"/>
            </el-select>
          </div>
          <div class="feishu-config-row">
            <span class="feishu-label">{{ $t('showSender') }}</span>
            <el-switch v-model="feishuShowSender" :active-value="0" :inactive-value="1"/>
          </div>
          <div class="feishu-config-row">
            <span class="feishu-label">{{ $t('showRecipient') }}</span>
            <el-switch v-model="feishuShowRecipient" :active-value="0" :inactive-value="1"/>
          </div>
          <div class="feishu-config-row">
            <span class="feishu-label">{{ $t('showTime') }}</span>
            <el-switch v-model="feishuShowTime" :active-value="0" :inactive-value="1"/>
          </div>
          <div class="feishu-config-row">
            <span class="feishu-label">{{ $t('showViewButton') }}</span>
            <el-switch v-model="feishuShowViewButton" :active-value="0" :inactive-value="1"/>
          </div>

          <div class="feishu-section-title">{{ $t('advancedConfig') }}</div>
          <el-input :placeholder="$t('customDomainDesc')" v-model="feishuCustomDomain"></el-input>
          <div class="feishu-config-row">
            <span class="feishu-label">{{ $t('sendFailureNotice') }}</span>
            <el-switch v-model="feishuFailureNotice" :active-value="0" :inactive-value="1"/>
          </div>
          <div class="feishu-section-title">{{ $t('getChatId') }}</div>
          <el-button type="primary" size="small" @click="openFeishuChatIdHelp" style="width: 100%;">
            {{ $t('getChatIdHelp') }}
          </el-button>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-switch v-model="feishuBotStatus" :active-value="0" :inactive-value="1" :active-text="$t('enable')"
                       :inactive-text="$t('btnBan')"/>
            <el-button :loading="settingLoading" type="primary" @click="feishuSave">
              {{ $t('save') }}
            </el-button>
          </div>
        </template>
      </el-dialog>
      <el-dialog
          v-model="feishuChatIdHelpShow"
          :title="feishuReceiveType === 1 ? $t('getFeishuOpenId') : $t('getFeishuChatId')"
          class="feishu-help-dialog"
          width="600"
      >
        <div class="feishu-help-content" v-if="feishuReceiveType === 1">
          <el-alert type="info" :closable="false">
            <p><strong>{{ $t('feishuPersonalModeTitle') }}</strong></p>
          </el-alert>
          <el-steps direction="vertical" :active="1" style="margin-top: 20px;">
            <el-step :title="$t('feishuPersonalStep1Title')">
              <template #description>
                <div class="step-desc">
                  <p>{{ $t('feishuPersonalStep1_1') }}</p>
                  <p>{{ $t('feishuPersonalStep1_2') }} <strong>{{ $t('avatar') }}</strong> → <strong>{{ $t('feishuSettings') }}</strong></p>
                  <p>{{ $t('feishuPersonalStep3Prefix') }} <strong>Open ID</strong></p>
                  <p>{{ $t('feishuPersonalStep1_4') }}<code>ou_xxxxxxxxxxxxxxxx</code></p>
                </div>
              </template>
            </el-step>
            <el-step :title="$t('feishuPersonalStep2Title')">
              <template #description>
                <div class="step-desc">
                  <p>{{ $t('feishuPersonalStep2_1') }}</p>
                  <p><strong>{{ $t('notice') }}：</strong>{{ $t('feishuPersonalModeNotice') }}</p>
                </div>
              </template>
            </el-step>
          </el-steps>
        </div>
        <div class="feishu-help-content" v-else>
          <el-steps direction="vertical" :active="1">
            <el-step :title="$t('feishuGroupStep1Title')">
              <template #description>
                <div class="step-desc">
                  <p>{{ $t('feishuGroupStep1_1') }}</p>
                  <p>{{ $t('feishuGroupStep2') }}</p>
                  <p>{{ $t('feishuGroupStep1_3') }} <strong>"{{ $t('copyLink') }}"</strong> {{ $t('or') }} <strong>"{{ $t('shareGroup') }}"</strong></p>
                  <p>{{ $t('feishuGroupStep1_4') }}<code>https://your-team.feishu.cn/share/base/oc_xxxxxxxx</code></p>
                </div>
              </template>
            </el-step>
            <el-step :title="$t('feishuGroupStep2Title')">
              <template #description>
                <div class="step-desc">
                  <p>{{ $t('feishuGroupStep2_1') }} <code>oc_</code> {{ $t('feishuGroupStep2_2') }}</p>
                  <p>{{ $t('example') }}：<code>https://your-team.feishu.cn/share/base/<strong>oc_a1b2c3d4e5f6</strong></code></p>
                  <p>{{ $t('feishuGroupStep2_3') }}：<strong>oc_a1b2c3d4e5f6</strong></p>
                </div>
              </template>
            </el-step>
            <el-step :title="$t('feishuApiStep3Title')">
              <template #description>
                <div class="step-desc">
                  <p>1. {{ $t('visit') }} <a href="https://open.feishu.cn/tool" target="_blank">{{ $t('feishuDeveloperTool') }}</a></p>
                  <p>{{ $t('feishuApiStep2') }}</p>
                  <p>{{ $t('feishuApiStep3_3') }} <strong>"{{ $t('onlineDebug') }}"</strong> {{ $t('feishuApiStep3_4') }}</p>
                  <pre>GET https://open.feishu.cn/open-apis/chat/list</pre>
                  <p>{{ $t('feishuApiStep3_5') }} <code>chat_id</code> {{ $t('feishuApiStep3_6') }}</p>
                </div>
              </template>
            </el-step>
          </el-steps>

          <div class="feishu-help-tip">
            <Icon icon="material-symbols:info" width="20" height="20"/>
            <span>{{ $t('tip') }}：{{ $t('feishuHelpTip') }} <code>oc_</code> {{ $t('feishuHelpTip2') }}</span>
          </div>
        </div>
        <template #footer>
          <el-button type="primary" @click="feishuChatIdHelpShow = false">{{ $t('gotIt') }}</el-button>
        </template>
      </el-dialog>
      <el-dialog
          v-model="thirdEmailShow"
          class="forward-dialog"
      >
        <template #header>
          <div class="forward-head">
            <span class="forward-set-title">{{ $t('otherEmail') }}</span>
            <el-tooltip effect="dark" :content="$t('otherEmailDesc')">
              <Icon class="warning" icon="fe:warning" width="18" height="18"/>
            </el-tooltip>
          </div>
        </template>
        <div class="forward-set-body">
          <el-input-tag tag-type="warning" :placeholder="$t('otherEmailInputDesc')" v-model="forwardEmail"
                        @add-tag="emailAddTag"></el-input-tag>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-switch v-model="forwardStatus" :active-value="0" :inactive-value="1" :active-text="$t('enable')"
                       :inactive-text="$t('disable')"/>
            <el-button :loading="settingLoading" type="primary" @click="forwardEmailSave">
              {{ $t('save') }}
            </el-button>
          </div>
        </template>
      </el-dialog>
      <el-dialog
          v-model="forwardRulesShow"
          class="forward-dialog"
      >
        <template #header>
          <div class="forward-head">
            <span class="forward-set-title">{{ $t('forwardingRules') }}</span>
            <el-tooltip effect="dark" :content="$t('forwardingRulesDesc')">
              <Icon class="warning" icon="fe:warning" width="18" height="18"/>
            </el-tooltip>
          </div>
        </template>
        <div class="forward-set-body">
          <el-input-tag :placeholder="$t('ruleEmailsInputDesc')" tag-type="success" v-model="ruleEmail"
                        @add-tag="ruleEmailAddTag"/>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-radio-group v-model="ruleType">
              <el-radio :value="0">{{ $t('forwardAll') }}</el-radio>
              <el-radio :value="1">{{ $t('rules') }}</el-radio>
            </el-radio-group>
            <el-button :loading="settingLoading" type="primary" @click="ruleEmailSave">
              {{ $t('save') }}
            </el-button>
          </div>
        </template>
      </el-dialog>
      <el-dialog class="resend-table" v-model="showResendList" :title="$t('resendTokenList')">
        <el-table :data="resendList">
          <el-table-column :min-width="emailColumnWidth" property="key" :label="$t('domain')"
                           :show-overflow-tooltip="true"/>
          <el-table-column :width="tokenColumnWidth" property="value" label="Token" fixed="right"
                           :show-overflow-tooltip="true"/>
        </el-table>
      </el-dialog>
      <el-dialog class="resend-table" v-model="showBrevoList" :title="$t('brevoTokenList')">
        <el-table :data="brevoList">
          <el-table-column :min-width="emailColumnWidth" property="key" :label="$t('domain')"
                           :show-overflow-tooltip="true"/>
          <el-table-column :width="tokenColumnWidth" property="value" label="Token" fixed="right"
                           :show-overflow-tooltip="true"/>
        </el-table>
      </el-dialog>
      <el-dialog v-model="regVerifyCountShow" :title="$t('rulesVerifyTitle',{count: regVerifyCount})"
                 @closed="regVerifyCount = setting.regVerifyCount">
        <form @submit.prevent>
          <el-input-number type="text" v-model="regVerifyCount" :min="1" @keyup.enter="saveRegVerifyCount">
          </el-input-number>
          <el-button type="primary" :loading="settingLoading" @click="saveRegVerifyCount">{{ $t('save') }}</el-button>
        </form>
      </el-dialog>
      <el-dialog v-model="addVerifyCountShow" :title="$t('rulesVerifyTitle',{count: addVerifyCount})"
                 @closed="addVerifyCount = setting.addVerifyCount">
        <form @submit.prevent>
          <el-input-number type="text" v-model="addVerifyCount" :min="1" @keyup.enter="saveAddVerifyCount"/>
          <el-button type="primary" :loading="settingLoading" @click="saveAddVerifyCount">{{ $t('save') }}</el-button>
        </form>
      </el-dialog>
      <el-dialog top="5vh" v-model="noticePopupShow" :title="$t('noticePopup')" class="notice-popup"
                 @closed="resetNoticeForm">
        <form @submit.prevent>
          <el-input v-model="noticeForm.noticeTitle" :placeholder="t('titleDesc')" @keyup.enter="saveNoticePopup"/>
          <div class="notice-line-item">
            <el-select v-model="noticeForm.noticeType">
              <template #prefix>
                <span style="margin-right: 10px">{{ $t('icon') }}</span>
              </template>
              <el-option key="none" label="None" value="none"/>
              <el-option key="primary" label="Primary" value="primary"/>
              <el-option key="success" label="Success" value="success"/>
              <el-option key="warning" label="Warning" value="warning"/>
              <el-option key="info" label="Info" value="info"/>
            </el-select>
            <el-select v-model="noticeForm.noticePosition">
              <template #prefix>
                <span style="margin-right: 10px">{{ $t('position') }}</span>
              </template>
              <el-option key="top-left" :label="t('topLeft')" value="top-left"/>
              <el-option key="top-right" :label="t('topRight')" value="top-right"/>
              <el-option key="bottom-left" :label="t('bottomLeft')" value="bottom-left"/>
              <el-option key="bottom-right" :label="t('bottomRight')" value="bottom-right"/>
            </el-select>
            <el-input-number v-model="noticeForm.noticeWidth">
              <template #prefix>
                {{ $t('width') }}
              </template>
              <template #suffix>
                px
              </template>
            </el-input-number>
            <el-input-number v-model="noticeForm.noticeOffset">
              <template #prefix>
                {{ $t('offset') }}
              </template>
              <template #suffix>
                px
              </template>
            </el-input-number>
            <el-input-number v-model="noticeForm.noticeDuration">
              <template #prefix>
                {{ $t('duration') }}
              </template>
              <template #suffix>
                ms
              </template>
            </el-input-number>
          </div>
          <div class="notice-popup-item">
            <el-input
                v-model="noticeForm.noticeContent"
                :autosize="{ minRows: 15, maxRows: 25 }"
                type="textarea"
                :placeholder="t('noticeContentDesc')"
            />
          </div>
        </form>
        <template #footer>
          <div class="dialog-footer">
            <el-switch v-model="noticeForm.notice" :active-value="0" :inactive-value="1" :active-text="$t('enable')"
                       :inactive-text="$t('disable')"/>
            <div>
              <el-button @click="previewNoticePopup">
                {{ $t('preview') }}
              </el-button>
              <el-button :loading="settingLoading" type="primary" @click="saveNoticePopup">
                {{ $t('save') }}
              </el-button>
            </div>
          </div>
        </template>
      </el-dialog>
      <el-dialog v-model="addS3Show" :title="t('s3Configuration')" width="340" @closed="resetAddS3Form">
        <form @submit.prevent>
          <el-input class="dialog-input" type="text" placeholder="Bucket" v-model="s3.bucket" @keyup.enter="saveS3"/>
          <el-input class="dialog-input" type="text" placeholder="Endpoint" v-model="s3.endpoint" @keyup.enter="saveS3"/>
          <el-input class="dialog-input" type="text" placeholder="Region" v-model="s3.region" @keyup.enter="saveS3"/>
          <el-input class="dialog-input" type="text" :placeholder="setting.s3AccessKey || 'Access Key'"
                    v-model="s3.s3AccessKey" @keyup.enter="saveS3"/>
          <el-input style="margin-bottom: 10px" type="text" :placeholder="setting.s3SecretKey || 'Secret Key'" v-model="s3.s3SecretKey" @keyup.enter="saveS3"/>
          <div class="force-path-style">
            <div class="force-path-style-left">
              <span>ForcePathStyle</span>
              <el-tooltip effect="dark" :content="$t('forcePathStyleDesc')">
                <Icon class="warning" icon="fe:warning" width="18" height="18"/>
              </el-tooltip>
            </div>
            <el-switch :before-change="beforeChange" :active-value="0" :inactive-value="1"
                       v-model="s3.forcePathStyle"/>
          </div>
          <div class="s3-button">
            <el-button :loading="clearS3Loading" @click="clearS3">{{ t('clear') }}</el-button>
            <el-button type="primary" :loading="settingLoading && !clearS3Loading" @click="saveS3">{{ t('save') }}</el-button>
          </div>
        </form>
      </el-dialog>
      <el-dialog v-model="emailPrefixShow" :title="t('emailPrefix')"  @closed="resetEmailPrefix"  >
        <div class="email-prefix">
          <div>{{ t('atLeast') }}</div>
          <el-input-number v-model="minEmailPrefix" :min="1" :max="20" style="width: 150px" @keyup.enter="saveEmailPrefix" >
            <template #suffix>
              <span>{{ t('character') }}</span>
            </template>
          </el-input-number>
        </div>
        <div class="prefix-filter">
          <div style="margin-bottom: 10px;">{{ t('mustNotContain') }}</div>
          <el-input-tag style="margin-bottom: 10px;" v-model="emailPrefixFilter"  />
        </div>
        <el-button type="primary" style="width: 100%;" :loading="settingLoading" @click="saveEmailPrefix">{{ $t('save') }}</el-button>
      </el-dialog>
      <el-dialog v-model="blackFormShow" class="forward-dialog" @closed="resetBlackList">
        <template #header>
          <div class="forward-head">
            <span class="forward-set-title">{{ $t('blackList') }}</span>
            <el-tooltip effect="dark" :content="$t('blackListDesc')">
              <Icon class="warning" icon="fe:warning" width="18" height="18"/>
            </el-tooltip>
          </div>
        </template>
        <el-form>
          <el-form-item :label="t('blackFromDesc')" label-position="top">
            <el-input-tag v-model="blackListForm.blackFrom" @add-tag="banEmailAddTag"  />
          </el-form-item>
          <el-form-item :label="t('blackSubjectDesc')" label-position="top">
            <el-input-tag v-model="blackListForm.blackSubject"/>
          </el-form-item>
          <el-form-item :label="t('blackContentDesc')" label-position="top">
            <el-input-tag v-model="blackListForm.blackContent"/>
          </el-form-item>
        </el-form>
        <el-button type="primary" style="width: 100%;" :loading="settingLoading" @click="saveBlackList">{{ $t('save') }}</el-button>
      </el-dialog>
        <el-dialog v-model="anonymousReceiveBlacklistShow" class="forward-dialog" @closed="resetAnonymousReceiveBlacklist">
          <template #header>
            <div class="forward-head">
              <span class="forward-set-title">{{ $t('anonymousReceiveBlacklist') }}</span>
              <el-tooltip effect="dark" :content="$t('anonymousReceiveBlacklistDesc')">
                <Icon class="warning" icon="fe:warning" width="18" height="18"/>
              </el-tooltip>
            </div>
          </template>
          <el-form>
            <el-form-item :label="t('anonymousReceiveBlacklistInputDesc')" label-position="top">
              <el-input
                  v-model="anonymousReceiveBlacklistText"
                  type="textarea"
                  :autosize="{ minRows: 3, maxRows: 6 }"
                  :placeholder="$t('anonymousReceiveBlacklistInputDesc')" />
            </el-form-item>
          </el-form>
          <el-button type="primary" style="width: 100%;" :loading="settingLoading" @click="saveAnonymousReceiveBlacklist">{{ $t('save') }}</el-button>
        </el-dialog>

        <el-dialog v-model="autoCleanShow" :title="t('autoClean')" class="forward-dialog" @closed="resetAutoClean">
          <el-form>
            <el-form-item :label="t('autoCleanDays')" label-position="top">
              <el-input-number v-model="autoCleanDays" :min="0" :max="3650" style="width: 100%"/>
            </el-form-item>
            <el-form-item :label="t('autoCleanExclude')" label-position="top">
              <el-input-tag
                  tag-type="warning"
                  :placeholder="$t('autoCleanExcludeDesc')"
                  v-model="autoCleanExclude"
                  @add-tag="autoCleanExcludeAddTag"
              />
            </el-form-item>
          </el-form>
          <el-button type="primary" style="width: 100%;" :loading="settingLoading" @click="saveAutoClean">{{ $t('save') }}</el-button>
        </el-dialog>
      <el-dialog v-model="aiCodeFilterShow" class="forward-dialog" @closed="resetAiCodeFilter">
        <template #header>
          <div class="forward-head">
            <span class="forward-set-title">{{ $t('codeRecognitionRules') }}</span>
            <el-tooltip effect="dark" :content="$t('codeRecognitionRulesDesc')">
              <Icon class="warning" icon="fe:warning" width="18" height="18"/>
            </el-tooltip>
          </div>
        </template>
        <el-form>
          <el-form-item :label="t('senderRules')" label-position="top">
            <el-input-tag v-model="aiCodeFilter" @add-tag="aiCodeFilterAddTag"/>
          </el-form-item>
        </el-form>
        <el-button type="primary" style="width: 100%;" :loading="settingLoading" @click="saveAiCodeFilter">{{ $t('save') }}</el-button>
      </el-dialog>

      <!-- 日志查看器对话框 -->
      <el-dialog v-model="logViewerShow" :title="$t('logViewer')" width="90%" height="80vh" class="log-viewer-dialog" :fullscreen="false">
        <div class="log-viewer-header">
          <div class="log-filter">
            <el-input
              v-model="logFilter.keyword"
              :placeholder="$t('searchLog')"
              clearable
              prefix-icon="material-symbols:search"
              style="max-width: 200px; width: 100%; margin-right: 10px; flex: 1; min-width: 150px;"
            />
            <el-select
              v-model="logFilter.level"
              :placeholder="$t('logLevel')"
              clearable
              style="max-width: 120px; width: 100%; margin-right: 10px; min-width: 100px;"
            >
              <el-option :label="$t('all')" value="" />
              <el-option :label="$t('debug')" value="debug" />
              <el-option :label="$t('info')" value="info" />
              <el-option :label="$t('warn')" value="warn" />
              <el-option :label="$t('error')" value="error" />
            </el-select>
            <el-select
              v-model="logFilter.type"
              :placeholder="$t('eventType')"
              clearable
              style="max-width: 120px; width: 100%; margin-right: 10px; min-width: 100px;"
            >
              <el-option :label="$t('all')" value="" />
              <el-option :label="$t('user')" value="user" />
              <el-option :label="$t('system')" value="system" />
              <el-option :label="$t('error')" value="error" />
              <el-option :label="$t('performance')" value="performance" />
            </el-select>
            <el-button
              type="primary"
              size="small"
              @click="clearAllLogs"
              style="margin-right: 10px;"
            >
              {{ $t('clearLog') }}
            </el-button>
            <el-button
              type="success"
              size="small"
              @click="refreshLogs"
              style="margin-right: 10px;"
            >
              {{ $t('refresh') }}
            </el-button>
            <el-select
              v-model="logExportFormat"
              :placeholder="$t('exportFormat')"
              clearable
              style="max-width: 120px; width: 100%; margin-right: 10px; min-width: 100px;"
            >
              <el-option label="CSV" value="csv" />
              <el-option label="TXT" value="txt" />
            </el-select>
            <el-button
              type="success"
              size="small"
              @click="exportLogs"
            >
              {{ $t('exportLog') }}
            </el-button>
          </div>
          <div class="log-info">
            <span>{{ $t('logCount', { count: filteredLogs.length }) }}</span>
          </div>
        </div>
        <div class="log-viewer-body">
          <el-table
            :data="filteredLogs"
            height="60vh"
            border
            stripe
            :default-sort="{prop: 'timestamp', order: 'descending'}"
            style="width: 100%;"
          >
            <el-table-column
              prop="timestamp"
              :label="$t('time')"
              min-width="180"
              sortable
              :formatter="formatTimestamp"
            />
            <el-table-column
              prop="level"
              :label="$t('level')"
              min-width="80"
              sortable
              :formatter="formatLogLevel"
            />
            <el-table-column
              prop="type"
              :label="$t('type')"
              min-width="80"
              sortable
              :formatter="formatLogType"
            />
            <el-table-column
              prop="message"
              :label="$t('description')"
              show-overflow-tooltip
              min-width="200"
              flex="1"
            />
            <el-table-column
              :label="$t('detail')"
              min-width="60"
              fixed="right"
            >
              <template #default="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="showLogDetail(scope.row)"
                >
                  {{ $t('detail') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-dialog>

      <!-- 日志详情对话框 -->
      <el-dialog v-model="logDetailShow" :title="$t('logDetail')" width="600px">
        <div v-if="selectedLog" class="log-detail">
          <div class="log-detail-item">
            <span class="label">{{ $t('time') }}：</span>
            <span class="value">{{ formatTimestamp(selectedLog) }}</span>
          </div>
          <div class="log-detail-item">
            <span class="label">{{ $t('level') }}：</span>
            <span class="value">{{ formatLogLevel(selectedLog) }}</span>
          </div>
          <div class="log-detail-item">
            <span class="label">{{ $t('type') }}：</span>
            <span class="value">{{ formatLogType(selectedLog) }}</span>
          </div>
          <div class="log-detail-item">
            <span class="label">{{ $t('description') }}：</span>
            <span class="value">{{ selectedLog.message }}</span>
          </div>
          <div v-if="Object.keys(selectedLog).length > 4" class="log-detail-item">
            <span class="label">{{ $t('extraInfo') }}：</span>
            <pre class="value">{{ JSON.stringify(selectedLog, (key, value) => {
              if (key === 'timestamp' || key === 'level' || key === 'type' || key === 'message') {
                return undefined;
              }
              return value;
            }, 2) }}</pre>
          </div>
        </div>
      </el-dialog>
    </el-scrollbar>
  </div>
</template>

<style scoped>
.log-viewer-dialog {
  .log-viewer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
    flex-wrap: wrap;
    gap: 10px;
  }

  .log-filter {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    flex: 1;
    min-width: 300px;
  }

  .log-info {
    font-size: 14px;
    color: #606266;
    min-width: 100px;
    text-align: right;
  }

  .log-viewer-body {
    overflow: auto;
    max-height: calc(80vh - 100px);
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .log-viewer-header {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }

    .log-filter {
      min-width: auto;
      flex-wrap: wrap;
    }

    .log-info {
      text-align: left;
    }

    .el-table {
      font-size: 12px;
    }

    .el-table-column {
      min-width: 60px !important;
    }
  }

  @media (max-width: 1200px) {
    .log-filter {
      gap: 5px;
    }

    .el-input,
    .el-select {
      margin-right: 5px !important;
      margin-bottom: 5px;
    }
  }

  .log-detail {
    .log-detail-item {
      margin-bottom: 10px;
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .label {
      font-weight: bold;
      width: 80px;
      flex-shrink: 0;
      margin-right: 10px;
    }

    .value {
      flex: 1;
      word-break: break-word;
      min-width: 200px;
    }

    pre.value {
      margin: 0;
      padding: 10px;
      background-color: #f5f7fa;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
    }
  }
}
</style>

<script setup>
import {computed, defineOptions, nextTick, onUnmounted, reactive, ref, watch} from "vue";
import {deleteBackground, setBackground, setBlackList, settingQuery, settingSet} from "@/request/setting.js";
import {useSettingStore} from "@/store/setting.js";
import {useUiStore} from "@/store/ui.js";
import {useUserStore} from "@/store/user.js";
import {useAccountStore} from "@/store/account.js";
import {useLogStore} from "@/store/log.js";
import {Icon} from "@iconify/vue";
import {cvtR2Url} from "@/utils/convert.js";
import {storeToRefs} from "pinia";
import {debounce} from 'lodash-es'
import {isDomain, isEmail} from "@/utils/verify-utils.js";
import loading from "@/components/loading/index.vue";
import {getTextWidth} from "@/utils/text.js";
import {fileToBase64} from "@/utils/file-utils.js"
import {useI18n} from 'vue-i18n';

defineOptions({
  name: 'sys-setting'
})

const {t, locale} = useI18n();
const firstLoading = ref(true)
const settingReady = ref(false)
const backgroundImage = ref('')
const localUpShow = ref(false)
const accountStore = useAccountStore();
const userStore = useUserStore();
const editTitleShow = ref(false)
const resendTokenFormShow = ref(false)
const brevoTokenFormShow = ref(false)
const blackFormShow = ref(false)
const anonymousReceiveBlacklistShow = ref(false)
const autoCleanShow = ref(false)
const aiCodeFilterShow = ref(false)
const r2DomainShow = ref(false)
const turnstileShow = ref(false)
const tgSettingShow = ref(false)
const feishuSettingShow = ref(false)
const noticePopupShow = ref(false)
const thirdEmailShow = ref(false)
const forwardRulesShow = ref(false)
const emailPrefixShow = ref(false)
const showResendList = ref(false)
const settingStore = useSettingStore();
const uiStore = useUiStore();
const logStore = useLogStore();
const showBrevoList = ref(false)
const {settings: setting} = storeToRefs(settingStore);
const editTitle = ref('')
const settingLoading = ref(false)
const clearS3Loading = ref(false)
const r2DomainInput = ref('')
const loginOpacity = ref(0)
const minEmailPrefix = ref(0)
const emailPrefixFilter = ref([])
const autoCleanDays = ref(0)
const autoCleanExclude = ref([])
const backgroundUrl = ref('')
let backgroundFile = {}
const showSetBackground = ref(false)
let regVerifyCount = ref(1)
let addVerifyCount = ref(1)
let r2MaxSize = ref(10)
let r2FileExpireDays = ref(7)
const anonymousReceiveCount = ref(10)
const anonymousReceiveDays = ref(0)
const anonymousReceiveDomains = ref([])
const saveAnonymousReceiveSettings = debounce(() => {
  if (!settingReady.value) return

  const count = normalizeAnonymousReceiveCount(anonymousReceiveCount.value)
  const days = normalizeAnonymousReceiveDays(anonymousReceiveDays.value)
  backup = JSON.stringify(setting.value)
  setting.value.anonymousReceiveCount = count
  setting.value.anonymousReceiveDays = days
  editSetting({anonymousReceiveCount: count, anonymousReceiveDays: days}, false)
}, 400, {
  leading: false,
  trailing: true
})

let backup = '{}'
let queuedSettingForm = null
let queuedSettingRefreshStatus = false
const addS3Show = ref(false)
const addVerifyCountShow = ref(false)
const regVerifyCountShow = ref(false)
// 日志设置相关
const detailedLog = ref(logStore.detailedLog ? 0 : 1)
const logViewerShow = ref(false)
const logDetailShow = ref(false)
const selectedLog = ref(null)
const logExportFormat = ref('csv') // 日志导出格式，默认CSV
const logFilter = reactive({
  keyword: '',
  level: '',
  type: '',
  sortBy: 'time',
  sortOrder: 'desc'
})

// 计算属性，获取过滤后的日志
const filteredLogs = computed(() => {
  return logStore.getFilteredLogs(logFilter)
})
const resendTokenForm = reactive({
  domain: '',
  token: '',
})
const brevoTokenForm = reactive({
  domain: '',
  token: '',
})
const turnstileForm = reactive({
  siteKey: '',
  secretKey: ''
})

const oauthPlatforms = [
  { key: 'google', label: 'Google', icon: 'devicon:google', iconType: 'iconify' },
  { key: 'github', label: 'GitHub', icon: 'codicon:github-inverted', iconType: 'iconify' },
  { key: 'gitlab', label: 'GitLab', icon: 'devicon:gitlab', iconType: 'iconify' },
  { key: 'linuxdo', label: 'LinuxDo', icon: '/image/linuxdo.webp', iconType: 'image' },
]
const oauthSettingShow = ref(false)
const oauthForm = reactive({
  key: '',
  label: '',
  clientId: '',
  clientSecret: '',
  switch: 1,
})

const s3 = reactive({
  bucket: '',
  endpoint: '',
  region: '',
  s3AccessKey: '',
  s3SecretKey: '',
  forcePathStyle: 1
})

const noticeForm = reactive({
  noticeTitle: '',
  noticeContent: '',
  noticeType: '',
  noticeDuration: '',
  noticePosition: '',
  noticeOffset: 0,
  notice: 0,
  noticeWidth: 0
})

const regKeyOptions = computed(() => [
  {label: t('enable'), value: 0},
  {label: t('disable'), value: 1},
  {label: t('optional'), value: 2},
])

const blackListForm = ref({
  blackSubject: [],
  blackContent: [],
  blackFrom: []
})
const anonymousReceiveBlacklistText = ref('')
const aiCodeFilter = ref([])

const anonymousReceiveDomainOptions = computed(() => {
  return Array.isArray(settingStore.domainList) ? settingStore.domainList : []
})

const authRefreshOptions = computed(() => [
  {label: t('disable'), value: 0},
  {label: '3s', value: 3},
  {label: '5s', value: 5},
  {label: '10s', value: 10},
  {label: '15s', value: 15},
  {label: '20s', value: 20},
])

const tgChatId = ref([])
const customDomain = ref('')
const tgBotStatus = ref(0)
const tgBotToken = ref('')
const forwardEmail = ref([])
const forwardStatus = ref(0)
const emailColumnWidth = ref(0)
const tokenColumnWidth = ref(0)
const ruleType = ref(0)
const ruleEmail = ref([])
const tgMsgFrom = ref('')
const tgMsgTo = ref('')
const tgMsgText = ref('')
const feishuAppId = ref('')
const feishuAppSecret = ref('')
const feishuChatId = ref([])
const feishuOpenId = ref([])
const feishuReceiveType = ref(0)
const feishuBotStatus = ref(1)
const feishuHeaderTemplate = ref('blue')
const feishuShowSender = ref(0)
const feishuShowRecipient = ref(0)
const feishuShowTime = ref(0)
const feishuShowViewButton = ref(0)
const feishuCustomDomain = ref('')
const feishuFailureNotice = ref(1)
const feishuChatIdHelpShow = ref(false)

const tgMsgFromOption = [{label: t('show'), value: 'show'}, {label: t('hide'), value: 'hide'}, {label: t('onlyName'), value:'only-name'}]
const tgMsgToOption = [{label: t('show'), value: 'show'}, {label: t('hide'), value: 'hide'}]
const tgMsgTextOption = [{label: t('show'), value: 'show'}, {label: t('hide'), value: 'hide'}]
const tgMsgLabelWidth = computed(() => locale.value === 'en' ? '120px' : '100px');

watch([anonymousReceiveCount, anonymousReceiveDays], () => {
  if (!settingReady.value) return
  saveAnonymousReceiveSettings()
})

getSettings()

// 初始化日志自动清理机制
logStore.initAutoCleanup()

function getSettings() {
  // 记录系统设置页面加载
  logStore.log('info', 'system', t('systemSettingLoading'))
  settingReady.value = false
  settingQuery().then(settingData => {
    setting.value = settingData
    settingStore.domainList = settingData.domainList;
    resendTokenForm.domain = setting.value.domainList[0]
    loginOpacity.value = setting.value.loginOpacity
    minEmailPrefix.value = setting.value.minEmailPrefix
    // 初始化R2存储设置，转换为GB和天
    r2MaxSize.value = Math.round((setting.value.r2MaxSize ?? 10737418240) / 1073741824)
    r2FileExpireDays.value = setting.value.r2FileExpireDays ?? 7
    firstLoading.value = false
    backgroundUrl.value = setting.value.background?.startsWith('http') ? setting.value.background : ''
    editTitle.value = setting.value.title
    r2DomainInput.value = setting.value.r2Domain
    addVerifyCount.value = setting.value.addVerifyCount
    regVerifyCount.value = setting.value.regVerifyCount
    anonymousReceiveCount.value = normalizeAnonymousReceiveCount(setting.value.anonymousReceiveCount)
    anonymousReceiveDays.value = normalizeAnonymousReceiveDays(setting.value.anonymousReceiveDays)
    resetAnonymousReceiveDomains()
    resetNoticeForm()
    resetAddS3Form()
    resetEmailPrefix()
    resetBlackList()
    resetAnonymousReceiveBlacklist()
    resetAiCodeFilter()
    nextTick(() => {
      settingReady.value = true
    })

    // 记录系统设置页面加载完成
    logStore.log('info', 'system', t('systemSettingLoaded'), {
      settingCount: Object.keys(settingData).length
    })
    // 记录debug级别日志，只有在详细日志模式下才会显示
    logStore.log('debug', 'system', t('systemSettingDetail'), {
      data: {
        domainListCount: settingData.domainList?.length || 0,
        hasBackground: !!settingData.background,
        hasR2Config: !!settingData.r2Domain
      }
    })
  }).catch(error => {
    // 记录错误日志
    logStore.log('error', 'system', t('systemSettingLoadFailed'), {
      error: error.message
    })
  })
}

const r2MaxSizeChange = debounce(() => {
  editSetting(
    { r2MaxSize: r2MaxSize.value * 1073741824 },
    false
  )
}, 500)

const r2FileExpireDaysChange = debounce(() => {
  editSetting(
    { r2FileExpireDays: r2FileExpireDays.value },
    false
  )
}, 500)

function openNoticePopup() {
  uiStore.showNotice()
}

function openAddVerifyCount() {
  if (settingLoading.value) return
  addVerifyCountShow.value = true
}

function openRegVerifyCount() {
  if (settingLoading.value) return
  regVerifyCountShow.value = true
}

function resetAddS3Form() {
  s3.bucket = setting.value.bucket
  s3.endpoint = setting.value.endpoint
  s3.region = setting.value.region
  s3.s3AccessKey = ''
  s3.s3SecretKey = ''
  s3.forcePathStyle = setting.value.forcePathStyle
}

const resendList = computed(() => {

  let list = Object.keys(setting.value.resendTokens || {}).map(key => {
    return {
      key: key,
      value: setting.value.resendTokens[key]
    };
  })

  if (list.length > 0) {

    const key = list.reduce((a, b) => compareByLengthAndUpperCase(a, b, 'key')).key;
    emailColumnWidth.value = getTextWidth(key) + 30;

    const value = list.reduce((a, b) => compareByLengthAndUpperCase(a, b, 'value')).value;
    tokenColumnWidth.value = getTextWidth(value) + 30;

  }

  return list;
});

const brevoList = computed(() => {

  let list = Object.keys(setting.value.brevoTokens || {}).map(key => {
    return {
      key: key,
      value: setting.value.brevoTokens[key]
    };
  })

  return list;
});

function saveAddVerifyCount() {
  if (!addVerifyCount.value) {
    addVerifyCount.value = 1
  }
  editSetting({addVerifyCount: addVerifyCount.value})
}

function saveRegVerifyCount() {
  if (!regVerifyCount.value) {
    regVerifyCount.value = 1
  }
  editSetting({regVerifyCount: regVerifyCount.value})
}

const compareByLengthAndUpperCase = (a, b, key) => {
  const getUpperCaseCount = (str) => (str.match(/[A-Z]/g) || []).length;
  if (a[key].length === b[key].length) {
    return getUpperCaseCount(a[key]) > getUpperCaseCount(b[key]) ? a : b;
  }
  return a[key].length > b[key].length ? a : b;
};


function closedSetBackground() {
  backgroundImage.value = ''
  localUpShow.value = false
  backgroundUrl.value = setting.value.background?.startsWith('http') ? setting.value.background : ''
}

function openTgSetting() {
  tgBotStatus.value = setting.value.tgBotStatus
  tgBotToken.value = ''
  customDomain.value = setting.value.customDomain
  tgMsgFrom.value = setting.value.tgMsgFrom
  tgMsgText.value = setting.value.tgMsgText
  tgMsgTo.value = setting.value.tgMsgTo
  tgChatId.value = []
  if (setting.value.tgChatId) {
    const list = setting.value.tgChatId.split(',')
    tgChatId.value.push(...list)
  }
  tgSettingShow.value = true
}

function openFeishuSetting() {
  feishuBotStatus.value = setting.value.feishuBotStatus || 1
  feishuAppId.value = setting.value.feishuAppId || ''
  feishuAppSecret.value = setting.value.feishuAppSecret || ''
  feishuChatId.value = []
  if (setting.value.feishuChatId) {
    const list = setting.value.feishuChatId.split(',')
    feishuChatId.value.push(...list)
  }
  feishuOpenId.value = []
  if (setting.value.feishuOpenId) {
    const list = setting.value.feishuOpenId.split(',')
    feishuOpenId.value.push(...list)
  }
  feishuReceiveType.value = setting.value.feishuReceiveType ?? 0
  feishuHeaderTemplate.value = setting.value.feishuHeaderTemplate || 'blue'
  feishuShowSender.value = setting.value.feishuShowSender ?? 0
  feishuShowRecipient.value = setting.value.feishuShowRecipient ?? 0
  feishuShowTime.value = setting.value.feishuShowTime ?? 0
  feishuShowViewButton.value = setting.value.feishuShowViewButton ?? 0
  feishuCustomDomain.value = setting.value.feishuCustomDomain || ''
  feishuFailureNotice.value = setting.value.feishuFailureNotice ?? 1
  feishuSettingShow.value = true
}

function feishuSave() {
  const form = {
    feishuAppId: feishuAppId.value,
    feishuAppSecret: feishuAppSecret.value,
    feishuBotStatus: feishuBotStatus.value,
    feishuChatId: feishuChatId.value + '',
    feishuOpenId: feishuOpenId.value + '',
    feishuReceiveType: feishuReceiveType.value,
    feishuHeaderTemplate: feishuHeaderTemplate.value,
    feishuShowSender: feishuShowSender.value,
    feishuShowRecipient: feishuShowRecipient.value,
    feishuShowTime: feishuShowTime.value,
    feishuShowViewButton: feishuShowViewButton.value,
    feishuCustomDomain: feishuCustomDomain.value,
    feishuFailureNotice: feishuFailureNotice.value
  }
  editSetting(form)
}

function openNoticePopupSetting() {
  noticePopupShow.value = true
}

function openResendList() {
  showResendList.value = true
}

function openBrevoList() {
  showBrevoList.value = true
}

function openFeishuChatIdHelp() {
  feishuChatIdHelpShow.value = true
}

function resetNoticeForm() {
  noticeForm.notice = setting.value.notice
  noticeForm.noticeContent = setting.value.noticeContent
  noticeForm.noticeDuration = setting.value.noticeDuration
  noticeForm.noticeTitle = setting.value.noticeTitle
  noticeForm.noticePosition = setting.value.noticePosition
  noticeForm.noticeType = setting.value.noticeType
  noticeForm.noticeOffset = setting.value.noticeOffset
  noticeForm.noticeWidth = setting.value.noticeWidth
}

function saveNoticePopup() {
  noticeForm.noticeOffset = noticeForm.noticeOffset || 0
  noticeForm.noticeWidth = noticeForm.noticeWidth || 0
  noticeForm.noticeDuration = noticeForm.noticeDuration || 0
  editSetting({...noticeForm})
}

function previewNoticePopup() {
  uiStore.previewNotice({...noticeForm})
}

function openThirdEmailSetting() {
  forwardEmail.value = []
  forwardStatus.value = setting.value.forwardStatus
  if (setting.value.forwardEmail) {
    const list = setting.value.forwardEmail.split(',')
    forwardEmail.value.push(...list)
  }
  thirdEmailShow.value = true
}

function openEmailPrefix() {
  emailPrefixShow.value = true
}

function openAutoClean() {
  autoCleanDays.value = setting.value.autoCleanDays ?? 0
  autoCleanExclude.value = setting.value.autoCleanExclude
      ? setting.value.autoCleanExclude.split(',').filter(Boolean)
      : []
  autoCleanShow.value = true
}

function openForwardRules() {
  ruleType.value = setting.value.ruleType
  ruleEmail.value = []
  if (setting.value.ruleEmail) {
    const list = setting.value.ruleEmail.split(',')
    ruleEmail.value.push(...list)
  }
  forwardRulesShow.value = true
}

function emailAddTag(val) {
  const emails = Array.from(new Set(
      val.split(/[,，]/).map(item => item.trim()).filter(item => item)
  ));

  forwardEmail.value.splice(forwardEmail.value.length - 1, 1)

  emails.forEach(email => {
    if (isEmail(email) && !forwardEmail.value.includes(email)) {
      forwardEmail.value.push(email)
    }
  })
}

function ruleEmailAddTag(val) {
  const emails = Array.from(new Set(
      val.split(/[,，]/).map(item => item.trim()).filter(item => item)
  ));

  ruleEmail.value.splice(ruleEmail.value.length - 1, 1)

  emails.forEach(email => {
    if (isEmail(email) && !ruleEmail.value.includes(email)) {
      ruleEmail.value.push(email)
    }
  })
}

function addChatTag(val) {

  const chatIds = Array.from(new Set(
      val.split(/[,，]/).map(item => item.trim()).filter(item => item)
  ));

  tgChatId.value.splice(tgChatId.value.length - 1, 1)

  chatIds.forEach(id => {
    if (!isNaN(Number(id))) {
      tgChatId.value.push(id)
    }
  })
}

function clearS3() {

  const form = {
    bucket: '',
    endpoint: '',
    region: '',
    s3AccessKey: '',
    s3SecretKey: '',
    forcePathStyle: 1
  }
  clearS3Loading.value = true
  editSetting(form)
}

function saveS3() {

  const form = {
    bucket: s3.bucket,
    endpoint: s3.endpoint,
    region: s3.region,
    forcePathStyle: s3.forcePathStyle
  }

  if (s3.s3AccessKey) form.s3AccessKey = s3.s3AccessKey
  if (s3.s3SecretKey) form.s3SecretKey = s3.s3SecretKey

  editSetting(form)
}

function tgBotSave() {
  const form = {
    customDomain: customDomain.value,
    tgBotStatus: tgBotStatus.value,
    tgChatId: tgChatId.value + '',
    tgMsgFrom: tgMsgFrom.value,
    tgMsgText: tgMsgText.value,
    tgMsgTo: tgMsgTo.value
  }
  if (tgBotToken.value) form.tgBotToken = tgBotToken.value
  editSetting(form)
}

function forwardEmailSave() {
  const form = {
    forwardStatus: forwardStatus.value,
    forwardEmail: forwardEmail.value + ''
  }
  editSetting(form)
}


function ruleEmailSave() {
  const form = {
    ruleEmail: ruleEmail.value + '',
    ruleType: ruleType.value
  }
  editSetting(form)
}

function doOpacityChange() {
  if (!settingReady.value) return
  const form = {}
  form.loginOpacity = loginOpacity.value
  editSetting(form, true)
}

function resetEmailPrefix() {
  minEmailPrefix.value = setting.value.minEmailPrefix
  emailPrefixFilter.value = setting.value.emailPrefixFilter
}

function resetBlackList() {
  blackListForm.value.blackFrom = setting.value.blackFrom ? setting.value.blackFrom.split(',') : []
  blackListForm.value.blackContent = setting.value.blackContent ? setting.value.blackContent.split(',') : []
  blackListForm.value.blackSubject = setting.value.blackSubject ? setting.value.blackSubject.split(',') : []
}

function resetAnonymousReceiveBlacklist() {
  anonymousReceiveBlacklistText.value = setting.value.anonymousReceiveBlacklist || ''
}

function resetAutoClean() {
  autoCleanDays.value = setting.value.autoCleanDays ?? 0
  autoCleanExclude.value = setting.value.autoCleanExclude
      ? setting.value.autoCleanExclude.split(',').filter(Boolean)
      : []
}

function resetAiCodeFilter() {
  aiCodeFilter.value = setting.value.aiCodeFilter ? setting.value.aiCodeFilter.split(',') : []
}

function saveEmailPrefix() {
  const form = {}
  form.minEmailPrefix = minEmailPrefix.value
  form.emailPrefixFilter = emailPrefixFilter.value
  editSetting(form, true)
}

function saveAutoClean() {
  editSetting({
    autoCleanDays: autoCleanDays.value,
    autoCleanExclude: autoCleanExclude.value.join(',')
  }, true)
}

function saveAiCodeFilter() {
  editSetting({aiCodeFilter: aiCodeFilter.value + ''})
}

const opacityChange = debounce(doOpacityChange, 1000, {
  leading: false,
  trailing: true
})

function saveBlackList() {

  let form = {
    blackContent: blackListForm.value.blackContent + '',
    blackSubject: blackListForm.value.blackSubject + '',
    blackFrom: blackListForm.value.blackFrom + ''
  }

  settingLoading.value = true

  setBlackList(form).then(() => {
    getSettings()
    ElMessage({
      message: t('setSuccess'),
      type: "success",
      plain: true
    })
    blackFormShow.value = false;
  }).finally(() => {
    settingLoading.value = false;
  })
}

function saveAnonymousReceiveBlacklist() {
  const rules = normalizeAnonymousReceiveBlockRules(anonymousReceiveBlacklistText.value)
  const value = rules + ''
  anonymousReceiveBlacklistText.value = value
  backup = JSON.stringify(setting.value)
  setting.value.anonymousReceiveBlacklist = value
  editSetting({anonymousReceiveBlacklist: value}, true)
}

function saveAnonymousReceiveCount(value) {
  const count = normalizeAnonymousReceiveCount(value ?? anonymousReceiveCount.value)
  anonymousReceiveCount.value = count
  saveAnonymousReceiveSettings()
}

function saveAnonymousReceiveDays(value) {
  const days = normalizeAnonymousReceiveDays(value ?? anonymousReceiveDays.value)
  anonymousReceiveDays.value = days
  saveAnonymousReceiveSettings()
}

function saveAnonymousReceiveDomains(value) {
  const domains = normalizeAnonymousReceiveDomains(value)
  if (!domains.length) {
    anonymousReceiveDomains.value = normalizeAnonymousReceiveDomains(setting.value.anonymousReceiveDomains)
    ElMessage({
      message: t('anonymousReceiveDomainsDesc'),
      type: 'warning',
      plain: true
    })
    return
  }

  anonymousReceiveDomains.value = domains
  backup = JSON.stringify(setting.value)
  setting.value.anonymousReceiveDomains = domains + ''
  editSetting({anonymousReceiveDomains: domains + ''}, false)
}

function normalizeAnonymousReceiveBlockRules(value) {
  return Array.from(new Set(
      String(value || '')
          .split(/[,，\n]/)
          .map(normalizeAnonymousReceiveBlockRule)
          .filter(Boolean)
  ))
}

function normalizeAnonymousReceiveBlockRule(rule) {
  const normalized = String(rule || '').trim().toLowerCase()
  if (!normalized || /\s/.test(normalized)) {
    return ''
  }
  if (isEmail(normalized) || normalized.includes('*') || normalized.includes('?')) {
    return normalized
  }
  if (normalized.startsWith('@')) {
    return `*${normalized}`
  }
  if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(normalized)) {
    return `*@${normalized}`
  }
  return ''
}

function resetAnonymousReceiveDomains() {
  anonymousReceiveDomains.value = normalizeAnonymousReceiveDomains(setting.value.anonymousReceiveDomains)
}

function normalizeAnonymousReceiveDomains(value) {
  const options = anonymousReceiveDomainOptions.value
  const selected = Array.isArray(value) ? value : String(value || '').split(/[,，]/)
  const normalized = selected
      .map(item => String(item || '').trim().toLowerCase())
      .map(item => item ? (item.startsWith('@') ? item : `@${item}`) : '')
      .filter(Boolean)
  const unique = Array.from(new Set(normalized))
      .map(item => options.find(option => option.toLowerCase() === item) || '')
      .filter(Boolean)

  return unique.length ? unique : [...options]
}

function banEmailAddTag(val) {
  const emails = Array.from(new Set(
      val.split(/[,，]/).map(item => item.trim()).filter(item => item)
  ));

  blackListForm.value.blackFrom.splice(blackListForm.value.blackFrom.length - 1, 1)

  emails.forEach(email => {
    if ((isEmail(email) || isDomain(email)) && !blackListForm.value.blackFrom.includes(email)) {
      blackListForm.value.blackFrom.push(email)
    }
  })
}

function autoCleanExcludeAddTag(val) {
  const emails = Array.from(new Set(
      val.split(/[,，]/).map(item => item.trim()).filter(item => item)
  ));

  autoCleanExclude.value.splice(autoCleanExclude.value.length - 1, 1)

  emails.forEach(email => {
    if (isEmail(email) && !autoCleanExclude.value.includes(email)) {
      autoCleanExclude.value.push(email)
    }
  })
}

function aiCodeFilterAddTag(val) {
  const emails = Array.from(new Set(
      val.split(/[,，]/).map(item => item.trim()).filter(item => item)
  ));

  aiCodeFilter.value.splice(aiCodeFilter.value.length - 1, 1)

  emails.forEach(email => {
    if ((isEmail(email) || isDomain(email)) && !aiCodeFilter.value.includes(email)) {
      aiCodeFilter.value.push(email)
    }
  })
}

function delBackground() {
  ElMessageBox.confirm(t('delBackgroundConfirm'), {
    confirmButtonText: t('confirm'),
    cancelButtonText: t('cancel'),
    type: 'warning'
  }).then(() => {
    deleteBackground().then(() => {
      backgroundUrl.value = ''
      setting.value.background = null
      ElMessage({
        message: t('delSuccessMsg'),
        type: "success",
        plain: true
      })
    })
  })
}

function openOauthSetting(p) {
  oauthForm.key = p.key
  oauthForm.label = p.label
  oauthForm.clientId = setting.value[p.key + 'ClientId'] || ''
  oauthForm.clientSecret = setting.value[p.key + 'ClientSecret'] || ''
  oauthForm.switch = setting.value[p.key + 'Switch'] ?? 1
  oauthSettingShow.value = true
}

function saveOauth() {
  const form = {}
  form[oauthForm.key + 'ClientId'] = oauthForm.clientId
  form[oauthForm.key + 'ClientSecret'] = oauthForm.clientSecret
  form[oauthForm.key + 'Switch'] = oauthForm.switch
  editSetting(form)
}

function saveTurnstileKey() {
  const settingForm = {}
  settingForm.siteKey = turnstileForm.siteKey
  settingForm.secretKey = turnstileForm.secretKey
  editSetting(settingForm)
}

async function saveBackground() {

  if (settingLoading.value) return

  let image = ''

  if (localUpShow.value) {
    image = await fileToBase64(backgroundFile, true);
  } else {
    if (backgroundUrl.value && !backgroundUrl.value.startsWith('http')) {
      ElMessage({
        message: t('imageLinkErrorMsg'),
        type: "error",
        plain: true
      })
      return
    }
    image = backgroundUrl.value
  }
  settingLoading.value = true

  setBackground(image).then(key => {
    setting.value.background = key
    showSetBackground.value = false
    ElMessage({
      message: t('saveSuccessMsg'),
      type: "success",
      plain: true
    })
    localUpShow.value = false
    backgroundImage.value = ''
  }).finally(() => {
    settingLoading.value = false
  })

}

function openSetBackground() {
  showSetBackground.value = true
}

function openCut() {
  const doc = document.createElement('input')
  doc.setAttribute('type', 'file')
  doc.setAttribute('accept', 'image/*')
  doc.click()
  doc.onchange = async (e) => {
    backgroundFile = e.target.files[0]
    backgroundImage.value = URL.createObjectURL(e.target.files[0])
    localUpShow.value = true
  }
}

function saveR2domain() {
  const settingForm = {r2Domain: r2DomainInput.value}
  editSetting(settingForm)
}

function openResendForm() {
  resendTokenFormShow.value = true
}

function openBrevoForm() {
  brevoTokenForm.domain = setting.value.domainList[0]
  brevoTokenFormShow.value = true
}

function openBlackListForm() {
  blackFormShow.value = true
}

function openAnonymousReceiveBlacklist() {
  anonymousReceiveBlacklistShow.value = true
}

function openAiCodeFilter() {
  aiCodeFilterShow.value = true
}

function saveResendToken() {
  const settingForm = {
    resendTokens: {}
  }
  const domain = resendTokenForm.domain.slice(1)
  settingForm.resendTokens[domain] = resendTokenForm.token
  editSetting(settingForm)
}

function saveBrevoToken() {
  const settingForm = {
    brevoTokens: {}
  }
  const domain = brevoTokenForm.domain.slice(1)
  settingForm.brevoTokens[domain] = brevoTokenForm.token
  editSetting(settingForm)
}

function cleanBrevoTokenForm() {
  brevoTokenForm.token = ''
}

function backupSetting() {
  const settingForm = {...setting.value}
  delete settingForm.resendTokens
  delete settingForm.siteKey
  delete settingForm.secretKey
  backup = JSON.stringify(setting.value)
}

function cleanResendTokenForm() {
  resendTokenForm.token = ''
}

function beforeChange() {
  if (!settingReady.value || settingLoading.value) return false
  backupSetting()
  return true
}

function change(e) {
  if (!settingReady.value) return
  const settingForm = {...setting.value}
  delete settingForm.siteKey
  delete settingForm.secretKey
  delete settingForm.s3AccessKey
  delete settingForm.s3SecretKey
  delete settingForm.tgBotToken
  delete settingForm.resendTokens
  delete settingForm.brevoTokens
  delete settingForm.feishuAppSecret
  editSetting(settingForm, false)
}

function changeField(key, value) {
  if (!settingReady.value) return
  backup = JSON.stringify(setting.value)
  setting.value[key] = value
  editSetting({[key]: value}, false)
}

function normalizeAnonymousReceiveCount(value) {
  const count = Number(value)
  if (count === -1) {
    return -1
  }
  if (Number.isNaN(count)) {
    return 10
  }
  return Math.min(Math.max(count, 0), 50)
}

function normalizeAnonymousReceiveDays(value) {
  const days = Number(value)
  if (Number.isNaN(days) || days < 0) {
    return 0
  }
  return Math.min(days, 365)
}

function saveTitle() {
  editSetting({title: editTitle.value})
}

function jump(href) {
  const doc = document.createElement('a')
  doc.href = href
  doc.target = '_blank'
  doc.click()
}

/**
 * 日志级别切换
 */
function logLevelChange() {
  const isDetailed = detailedLog.value === 0
  const message = isDetailed ? t('detailedLogEnabled') : t('detailedLogDisabled')
  logStore.setDetailedLog(isDetailed)
  logStore.log('info', 'system', message)
  ElMessage({
    message,
    type: "success",
    plain: true
  })
}

/**
 * 打开日志查看器
 */
function openLogViewer() {
  logViewerShow.value = true
}

/**
 * 格式化时间戳
 * @param {object} row - 日志行数据
 * @returns {string} 格式化后的时间字符串
 */
function formatTimestamp(row) {
  const date = new Date(row.timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    millisecond: '3-digit'
  })
}

/**
 * 格式化日志级别
 * @param {object} row - 日志行数据
 * @returns {string} 格式化后的日志级别
 */
function formatLogLevel(row) {
  const levelMap = {
    debug: t('debug'),
    info: t('info'),
    warn: t('warn'),
    error: t('error')
  }
  return levelMap[row.level] || row.level
}

/**
 * 格式化日志类型
 * @param {object} row - 日志行数据
 * @returns {string} 格式化后的日志类型
 */
function formatLogType(row) {
  const typeMap = {
    user: t('user'),
    system: t('system'),
    error: t('error'),
    performance: t('performance')
  }
  return typeMap[row.type] || row.type
}

/**
 * 显示日志详情
 * @param {object} log - 日志对象
 */
function showLogDetail(log) {
  selectedLog.value = log
  logDetailShow.value = true
}

/**
 * 清空所有日志
 */
function clearAllLogs() {
  ElMessageBox.confirm(t('clearLogConfirm'), {
    confirmButtonText: t('confirm'),
    cancelButtonText: t('cancel'),
    type: 'warning'
  }).then(() => {
    logStore.clearLogs()
    ElMessage({
      message: t('logCleared'),
      type: "success",
      plain: true
    })
  })
}

/**
 * 刷新日志
 */
function refreshLogs() {
  // 日志是实时更新的，这里只需要触发视图更新即可
  ElMessage({
    message: t('logRefreshed'),
    type: "success",
    plain: true
  })
}

/**
 * 导出日志
 */
function exportLogs() {
  const logs = filteredLogs.value
  if (logs.length === 0) {
    ElMessage({
      message: t('noLogsToExport'),
      type: "warning",
      plain: true
    })
    return
  }

  let content = ''
  let filename = ''

  if (logExportFormat.value === 'csv') {
    // 导出为CSV格式
    content = `${t('time')},${t('level')},${t('type')},${t('description')}\n`
    logs.forEach(log => {
      const time = formatTimestamp(log)
      const level = formatLogLevel(log)
      const type = formatLogType(log)
      const message = log.message.replace(/"/g, '""') // 转义双引号
      content += `"${time}","${level}","${type}","${message}"\n`
    })
    filename = `logs_${new Date().toISOString().slice(0, 10)}.csv`
  } else {
    // 导出为TXT格式
    logs.forEach(log => {
      const time = formatTimestamp(log)
      const level = formatLogLevel(log)
      const type = formatLogType(log)
      content += `${time} [${level}] [${type}] ${log.message}\n`
    })
    filename = `logs_${new Date().toISOString().slice(0, 10)}.txt`
  }

  // 创建下载链接并触发下载
  const blob = new Blob([content], { type: logExportFormat.value === 'csv' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // 记录日志导出操作
  logStore.log('info', 'system', t('logExported'), {
    format: logExportFormat.value,
    count: logs.length
  })

  ElMessage({
    message: t('logExportSuccess', { count: logs.length }),
    type: "success",
    plain: true
  })
}

function editSetting(settingForm, refreshStatus = true) {
  if (settingLoading.value) {
    queuedSettingForm = {...(queuedSettingForm || {}), ...settingForm}
    queuedSettingRefreshStatus = queuedSettingRefreshStatus || refreshStatus
    return
  }
  settingLoading.value = true

  settingSet(settingForm).then(() => {
    ElMessage({
      message: t('saveSuccessMsg'),
      type: "success",
      plain: true
    })
    if (setting.value.manyEmail === 1) {
      accountStore.currentAccountId = userStore.user.account.accountId;
    }
    if (refreshStatus) {
      getSettings()
    }
    editTitleShow.value = false
    r2DomainShow.value = false
    resendTokenFormShow.value = false
    brevoTokenFormShow.value = false
    turnstileShow.value = false
    tgSettingShow.value = false
    feishuSettingShow.value = false
    thirdEmailShow.value = false
    forwardRulesShow.value = false
    addVerifyCountShow.value = false
    regVerifyCountShow.value = false
    noticePopupShow.value = false
    addS3Show.value = false
    emailPrefixShow.value = false
    anonymousReceiveBlacklistShow.value = false
    aiCodeFilterShow.value = false
    autoCleanShow.value = false
    oauthSettingShow.value = false
  }).catch((e) => {
    loginOpacity.value = setting.value.loginOpacity
    setting.value = {...setting.value, ...JSON.parse(backup)}
    anonymousReceiveCount.value = normalizeAnonymousReceiveCount(setting.value.anonymousReceiveCount)
    anonymousReceiveDays.value = normalizeAnonymousReceiveDays(setting.value.anonymousReceiveDays)
    resetAnonymousReceiveDomains()
    resetAnonymousReceiveBlacklist()
  }).finally(() => {
    settingLoading.value = false
    clearS3Loading.value = false
    if (queuedSettingForm) {
      const nextForm = queuedSettingForm
      const nextRefreshStatus = queuedSettingRefreshStatus
      queuedSettingForm = null
      queuedSettingRefreshStatus = false
      nextTick(() => editSetting(nextForm, nextRefreshStatus))
    }
  })
}

onUnmounted(() => {
  saveAnonymousReceiveSettings.flush()
})
</script>

<style scoped lang="scss">
.settings-container {
  height: 100%;
  overflow: hidden;
  background: var(--extra-light-fill) !important;
  position: relative;

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    z-index: 2;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  .loading-show {
    transition: all 200ms ease 200ms;
    opacity: 1;
  }

  .loading-hide {
    transition: var(--loading-hide-transition);
    pointer-events: none;
    opacity: 0;
  }
}

.scroll {
  width: 100%;
  min-height: 100%;

  :deep(.el-scrollbar__view) {
    height: 100%;
  }

  .scroll-body {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}

.card-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 20px;
  @media (max-width: 1023px) {
    gap: 15px;
    padding: 15px;
  }
}

.background {
  width: 249px;
  height: 140px;
  border-radius: 4px;
  border: 1px solid var(--light-border);
  @media (max-width: 500px) {
    width: 160px;
    height: 90px;
  }
}

.background-btn {
  display: flex;
  gap: 10px;
  flex-direction: column;
}

.bot-verify-select {
  margin-left: 10px;
}

.settings-card {
  background-color: var(--el-bg-color);
  border-radius: 6px;
  border: 1px solid var(--el-border-color);
  transition: all 300ms;
  overflow: hidden;
  max-width: 900px;
  width: 100%;
}


.card-title {
  font-size: 15px;
  font-weight: bold;
  padding: 15px 20px 12px;
  border-bottom: 1px solid var(--el-border-color);
}

.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.setting-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  font-weight: normal;

  > div:first-child {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  > div:last-child {
    display: grid;
    grid-template-columns: 1fr auto;
    justify-items: flex-end;
    font-weight: normal;
  }
}

.oauth-icon {
  width: 22px !important;
  height: 22px !important;
  min-width: 22px;
  flex-shrink: 0;
  margin-right: 2px;
}

.r2domain-item {
  display: flex;
  gap: 10px;
  > div:first-child {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  > div:last-child {
    flex: 1;
    text-align: right;
  }
}

.title-icon.warning {
  position: relative;
  top: 2px;
  cursor: pointer;
  margin-left: 2px;
}

.warning {
  margin-left: 2px;
  color: grey;
  cursor: pointer;
}

.cropper {
  border-radius: 4px;
  border: 1px solid #D4D7DE;
  height: 397px;
  width: 705px;
  @media (max-width: 767px) {
    width: calc(100vw - 60px);
    height: calc((100vw - 60px) * 9 / 16);
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
}

.notice-popup-item {
  margin-top: 15px;
}

.notice-line-item {
  margin-top: 15px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px;

  > * {
    width: 100%;
  }

  @media (max-width: 840px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 580px) {
    grid-template-columns: 1fr;
  }
}

.background-url {
  width: min(calc(100vw - 70px), 500px);
}


:deep(.el-dialog) {
  width: 400px !important;
  @media (max-width: 440px) {
    width: calc(100% - 40px) !important;
    margin-right: 20px !important;
    margin-left: 20px !important;
  }
}

:deep(.resend-table.el-dialog) {
  min-height: 300px;
  width: 500px !important;
  @media (max-width: 540px) {
    width: calc(100% - 40px) !important;
    margin-right: 20px !important;
    margin-left: 20px !important;
  }
}

:deep(.notice-popup.el-dialog) {
  min-height: 300px;
  width: 820px !important;
  @media (max-width: 860px) {
    width: calc(100% - 40px) !important;
    margin-right: 20px !important;
    margin-left: 20px !important;
  }
}

:deep(.resend-table .el-dialog__header) {
  padding-bottom: 5px;
}

:deep(.el-table__inner-wrapper:before) {
  background: var(--el-bg-color);
}

:deep(.cut-dialog.el-dialog) {
  width: fit-content !important;
  height: fit-content !important;
}


:deep(.forward-dialog.el-dialog) {
  width: 500px !important;
  @media (max-width: 540px) {
    width: calc(100% - 40px) !important;
    margin-right: 20px !important;
    margin-left: 20px !important;
  }
}

.forward-dialog {
  .forward-head {
    display: flex;
    align-items: center;

    .forward-set-title {
      top: 1px;
      padding-right: 5px;
      position: relative;
      font-size: 16px;
      font-weight: bold;;
    }
  }
}

// Feishu dialog specific styles
.feishu-dialog {
  .feishu-section-title {
    font-size: 14px;
    font-weight: bold;
    color: var(--el-text-color-primary);
    margin: 15px 0 10px 0;
    padding-bottom: 5px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .feishu-config-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;

    .feishu-label {
      font-size: 14px;
      color: var(--el-text-color-regular);
    }
  }
}

// Feishu help dialog styles
.feishu-help-dialog {
  .feishu-help-content {
    padding: 10px 0;

    .step-desc {
      margin-top: 8px;
      line-height: 1.8;

      p {
        margin: 5px 0;
        font-size: 13px;
      }

      strong {
        color: var(--el-color-primary);
        font-weight: 600;
      }

      code {
        background: var(--el-fill-color-light);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: var(--el-color-danger);
      }

      pre {
        background: var(--el-fill-color);
        padding: 10px;
        border-radius: 4px;
        margin: 8px 0;
        overflow-x: auto;
        font-size: 12px;
        font-family: 'Courier New', monospace;
      }

      a {
        color: var(--el-color-primary);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .feishu-help-tip {
    margin-top: 20px;
    padding: 12px;
    background: var(--el-color-info-light-9);
    border-left: 3px solid var(--el-color-info);
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--el-color-info);

    code {
      background: var(--el-fill-color-light);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: var(--el-color-danger);
    }
  }
}

.error-image {
  background: var(--light-ill);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.cut-button {
  padding-top: 15px;
  width: 100%;
  display: flex;
  justify-content: space-between;

  .el-button {
    width: fit-content;
  }
}

.bot-verify {
  display: grid;
  grid-template-columns: 1fr auto;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  span {
    display: flex;
    align-items: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .el-button {
    width: 48px;
    margin: 0 0 0 10px;
  }
}

.forward-set-body {
  display: flex;
  flex-direction: column;

  .el-switch {
    align-self: end;
  }

  > *:nth-child(-n+2) {
    margin-bottom: 15px;
  }

  .tg-msg-label {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .el-select {
      width: v-bind(tgMsgLabelWidth);
    }
  }
}

.forward {
  span {
    display: flex;
    align-items: center;
  }

  .el-button {
    width: 48px;
    margin: 0 0 0 10px;
  }
}

.opt-button {
  width: fit-content !important;
}

.email-prefix {
  display: flex;
  justify-content: space-between;
}

.prefix-filter {
  display: flex;
  flex-direction: column;
}

.s3-button {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 15px;

  .el-button {
    margin-left: 0;
  }
}

.r2domain {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;

  .storage-type {
    margin-right: 3px;
  }

  span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .el-button {
    width: 48px;
    margin: 0 0 0 10px;
  }
}

.personalized {
  align-items: start;

  > div:last-child {
    display: flex;
    justify-content: end;

    .el-button {
      margin-left: 10px;
      margin-top: 0;
    }
  }
}

.dialog-input {
  margin-bottom: 15px;
}

.force-path-style {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  .force-path-style-left {
    padding-left: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
  }
}

.concerning-item {
  display: flex;
  align-items: center;

  .community {
    display: flex;
    row-gap: 10px;
    flex-wrap: wrap;
  }

  :deep(.el-button) {
    padding: 0 10px;
    font-weight: normal;

    i {
      font-size: 22px;
    }
  }

  > span:first-child {
    font-weight: normal;
    padding-right: 20px;
    white-space: nowrap;
  }
}

.email-title {
  font-weight: normal !important;
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr auto;
  align-items: center;

  span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .el-button {
    margin-top: 0;
  }
}

.token-item {
  padding-top: 0;

  div:last-child {
    font-weight: normal;
  }
}

form .el-button {
  margin-top: 10px;
  width: 100%;
}

.el-switch {
  height: 28px;
}


:deep(.el-button--small) {
  margin-top: 2px !important;
  margin-bottom: 2px !important;
  height: 24px;
}

:deep(.el-select__wrapper) {
  min-height: 28px;
}

</style>

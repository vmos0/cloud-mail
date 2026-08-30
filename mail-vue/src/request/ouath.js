import http from '@/axios/index.js';

export function oauthLoginApi(provider, code, redirectUri) {
    return http.post(`/oauth/${provider}/login`, {code, redirectUri})
}

export function oauthBindUser(form) {
    return http.put('/oauth/bindUser', form)
}
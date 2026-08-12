import http from '@/axios/index.js';

export function oauthLoginApi(provider, code) {
    return http.post(`/oauth/${provider}/login`, {code})
}

export function oauthBindUser(form) {
    return http.put('/oauth/bindUser', form)
}
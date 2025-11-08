// Resolve the WEBHOOK_URL for FastenSnap.
// Priority (first available):
// 1. process.env.WEBHOOK_URL (useful for EAS or build-time injection)
// 2. expo constants extra (if provided via app config)
// 3. config/webhook.local.ts (gitignored local file)
// 4. fallback to empty string

import Constants from 'expo-constants';

let WEBHOOK_URL = '';

// 1) process.env (may be available during build-time)
try {
	// @ts-ignore
	if (typeof process !== 'undefined' && process.env && process.env.WEBHOOK_URL) {
		// @ts-ignore
		WEBHOOK_URL = process.env.WEBHOOK_URL;
	}
} catch (e) {
	// ignore
}

// 2) expo constants extra
try {
	const extra = (Constants as any)?.expoConfig?.extra ?? (Constants as any)?.manifest2?.extra ?? (Constants as any)?.manifest?.extra;
	if (extra && extra.WEBHOOK_URL) WEBHOOK_URL = extra.WEBHOOK_URL;
} catch (e) {
	// ignore
}

// 3) local file (gitignored) — useful for local dev
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const local = require('./webhook.local');
	if (local && local.WEBHOOK_URL) WEBHOOK_URL = local.WEBHOOK_URL;
} catch (e) {
	// not present — fine
}

export { WEBHOOK_URL };

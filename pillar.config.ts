import {
	discardAtlaspackFSEventsTransformer,
	discardEmptyTransformer,
	quietTesseractTransformer,
} from '@atlassian/pillar/logger';
import type { ConfigObject } from '@atlassian/pillar/config/types';
import { dummyServicePlugin } from './plugins/dummy-service-plugin';

const pillarConfig: ConfigObject = {
	hostname: getDevHostname(),
	logTransformers: [
		discardEmptyTransformer,
		discardAtlaspackFSEventsTransformer,
		quietTesseractTransformer,
	],
	ssrEntryPattern: 'bifrost-template.tsx',
	experiment: {
		plugins: [dummyServicePlugin],
		ssrEntries: ['./src/entry-fs/bifrost-template.tsx'],
	},
};

function getDevHostname() {
	const envDns = process.env.RDE_DNS;
	return typeof envDns === 'string' && envDns.trim() ? envDns.trim() : 'localhost';
}

export default pillarConfig;

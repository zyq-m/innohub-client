import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Client from 'ssh2-sftp-client';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const localRoot = path.join(projectRoot, 'dist');
const remoteRoot = (process.env.SFTP_REMOTE_ROOT || '/www/innohub').replace(/\/+$/, '');

const config = {
	host: process.env.SFTP_HOST,
	port: Number(process.env.SFTP_PORT) || 22,
	username: process.env.SFTP_USERNAME,
	password: process.env.SFTP_PASSWORD,
};

const PRUNED_DIRS = ['assets'];
const LAST = ['index.html'];

const sftp = new Client();

function listLocalFiles(dir) {
	return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const abs = path.join(dir, entry.name);
		const rel = path.relative(localRoot, abs).split(path.sep).join('/');
		return entry.isDirectory() ? listLocalFiles(abs) : [rel];
	});
}

function humanSize(bytes) {
	return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} kB`;
}

async function walkRemote(dir) {
	const files = [];
	let entries;
	try {
		entries = await sftp.list(dir);
	} catch {
		return files;
	}
	for (const entry of entries) {
		const abs = `${dir}/${entry.name}`;
		if (entry.type === 'd') files.push(...(await walkRemote(abs)));
		else files.push(abs);
	}
	return files;
}

async function upload(files, phase) {
	if (!files.length) return;
	console.log(`Uploading ${phase} (${files.length} file${files.length === 1 ? '' : 's'})`);
	let bytes = 0;
	for (const rel of files) {
		const local = path.join(localRoot, rel);
		const remote = `${remoteRoot}/${rel}`;
		await sftp.mkdir(remote.slice(0, remote.lastIndexOf('/')), true);
		await sftp.fastPut(local, remote);
		bytes += fs.statSync(local).size;
	}
	console.log(`  ${humanSize(bytes)} transferred`);
}

async function pruneStale(localFiles) {
	const localSet = new Set(localFiles);
	let removed = 0;
	for (const dir of PRUNED_DIRS) {
		const base = `${remoteRoot}/${dir}`;
		for (const remoteFile of await walkRemote(base)) {
			const rel = remoteFile.replace(`${remoteRoot}/`, '');
			if (localSet.has(rel)) continue;
			await sftp.delete(remoteFile).catch(() => {});
			removed += 1;
		}
	}
	console.log(`Pruned ${removed} stale file${removed === 1 ? '' : 's'}`);
}

function validate() {
	const missing = ['SFTP_HOST', 'SFTP_USERNAME', 'SFTP_PASSWORD'].filter((key) => !process.env[key]);
	if (missing.length) {
		throw new Error(`Missing ${missing.join(', ')} — check .env.deploy (see .env.deploy.example).`);
	}
	if (!fs.existsSync(localRoot)) {
		throw new Error('dist/ not found. Run "npm run build" first.');
	}
}

async function assertWritable() {
	const probe = `${remoteRoot}/.sftp_write_test`;
	try {
		await sftp.put(Buffer.from('ok'), probe);
		await sftp.delete(probe);
	} catch (error) {
		throw new Error(
			`Cannot write to ${remoteRoot} (${error.message}). ` +
				`Ask the server admin to run: sudo chown -R ${config.username}:${config.username} ${remoteRoot}`,
		);
	}
}

async function deploy() {
	validate();

	console.log('Connecting to SFTP...');
	await sftp.connect(config);
	console.log(`Connected to ${config.host}:${config.port}`);

	await assertWritable();

	const files = listLocalFiles(localRoot);
	const first = files.filter((rel) => !LAST.includes(rel));
	const last = files.filter((rel) => LAST.includes(rel));

	console.log(`Local:  ${localRoot}`);
	console.log(`Remote: ${remoteRoot}`);
	console.log(`Build:  ${files.length} files\n`);

	await upload(first, '1/2 - assets & static files');
	await upload(last, '2/2 - index.html (last)');
	await pruneStale(files);

	console.log('\nDeployment completed.');
}

try {
	await deploy();
} catch (error) {
	console.error('\nDeployment failed:', error.message || error);
	process.exitCode = 1;
} finally {
	await sftp.end();
}

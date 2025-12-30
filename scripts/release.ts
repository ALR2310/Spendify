import 'dotenv/config';

import { GoogleGenAI } from '@google/genai';
import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';
import { readdir, readFile } from 'fs/promises';
import capitalize from 'lodash/capitalize';
import path from 'path';
import semver from 'semver';

import pkg from '../package.json' with { type: 'json' };

const repo = process.env.VITE_GIT_REPO!;
const token = process.env.VITE_GIT_PAT!;
const [owner, repoName] = repo.split('/');
const githubSha = process.env.GITHUB_SHA ?? 'main';
const geminiKey = process.env.GEMINI_API_KEY;

const octokit = new Octokit({ auth: token });

const AI = new GoogleGenAI({ apiKey: geminiKey });
const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-3-flash'];

// ================= Helper method =================//

function isQuotaError(error: any): boolean {
  return (
    error?.status === 429 ||
    error?.statusCode === 429 ||
    error?.code === 429 ||
    String(error?.message).includes('429')
  );
}

async function gemini(prompt: string): Promise<string> {
  for (const model of MODELS) {
    try {
      const response = await AI.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;

      console.warn(`[Gemini] Empty response from model: ${model}`);
    } catch (error: any) {
      if (isQuotaError(error)) {
        console.warn(`[Gemini] Quota exceeded on model ${model}, fallback to next`);
        continue;
      }

      console.error(`[Gemini] Error on model ${model}:`, error?.message || error);
    }
  }

  console.error('[Gemini] All models failed. Returning empty string.');
  return '';
}

async function retry<T>(fn: () => Promise<T>, retries = 3, delayMs = 2000) {
  try {
    return await fn();
  } catch (err: any) {
    const isRetryable =
      err.status === 500 ||
      err.status === 502 ||
      err.status === 503 ||
      err.status === 504 ||
      err.code === 'EPIPE' ||
      err.message?.includes('fetch failed') ||
      err.message?.includes('other side closed');

    if (retries > 0 && isRetryable) {
      console.warn(`[retry] ${err.message || err} - retrying in ${delayMs}ms... (${retries} left)`);
      await new Promise((r) => setTimeout(r, delayMs));
      return retry(fn, retries - 1, delayMs);
    }

    throw err;
  }
}

// ================= Github method =================//

async function getLatestRelease() {
  try {
    const res = await retry(() => octokit.rest.repos.getLatestRelease({ owner, repo: repoName }));
    return res.data;
  } catch (err: any) {
    if (err.status !== 404) throw err;
    const res = await retry(() => octokit.rest.repos.listReleases({ owner, repo: repoName, per_page: 1 }));
    return res.data[0] ?? null;
  }
}

async function getFirstCommitSha() {
  const commits = await octokit.paginate(octokit.rest.repos.listCommits, {
    owner,
    repo: repoName,
    per_page: 100,
  });
  return commits[commits.length - 1]?.sha;
}

async function getLatestCommitSha() {
  const latestCommit = await retry(() =>
    octokit.rest.repos.getCommit({
      owner,
      repo: repoName,
      ref: githubSha,
    }),
  );
  return latestCommit.data.sha;
}

async function getBaseSha(latestVersion: string): Promise<string> {
  if (latestVersion === '0.0.0') {
    return await getFirstCommitSha();
  } else {
    const tag = `v${latestVersion}`;
    const res = await octokit.rest.git.getRef({
      owner,
      repo: repoName,
      ref: `tags/${tag}`,
    });
    return res.data.object.sha;
  }
}

// ================= Main method =================//

interface Attachment {
  filePath: string;
  fileName: string;
  contentType: string;
}

async function getVersions() {
  const latest = await getLatestRelease();

  return {
    version: pkg.version,
    androidVersion: pkg.androidVersion,
    latestVersion: latest ? latest.tag_name.replace(/^v/, '') : '0.0.0',
  };
}

async function generateChangelog(oldVersion: string) {
  const headSha = await getLatestCommitSha(); // current commit SHA
  const baseSha = await getBaseSha(oldVersion); // SHA of the latest release tag

  const comparison = await retry(() =>
    octokit.rest.repos.compareCommits({
      owner,
      repo: repoName,
      base: baseSha,
      head: headSha,
    }),
  );

  const changelogText = comparison.data.commits
    .map((c) => ({
      message: c.commit.message,
    }))
    .map((c) => `- ${c.message}`)
    .join('\n');

  const template = await readFile(path.join('scripts', 'template.md'), 'utf-8');
  const prompt = `${template} ${changelogText}`;

  return await gemini(prompt);
}

async function getFiles(): Promise<Attachment[]> {
  const apkDir = path.join('android', 'app', 'build', 'outputs', 'apk', 'release');

  try {
    const files = await readdir(apkDir);
    const apkFiles = files.filter((file) => file.endsWith('.apk'));

    return apkFiles.map((fileName) => ({
      filePath: path.join(apkDir, fileName),
      fileName,
      contentType: 'application/vnd.android.package-archive',
    }));
  } catch (error) {
    console.error(`Failed to read APK directory: ${apkDir}`, error);
    return [];
  }
}

async function createRelease(version: string, changelog: string, attachments: Attachment[]) {
  const appName = pkg.name;

  const release = await retry(() =>
    octokit.rest.repos.createRelease({
      owner,
      repo: repoName,
      tag_name: `v${version}`,
      name: `${capitalize(appName)} v${version}`,
      body: changelog,
      draft: false,
      prerelease: false,
    }),
  );

  const upload = async (attachment: Attachment) => {
    const data = await readFile(attachment.filePath);
    await retry(() =>
      octokit.rest.repos.uploadReleaseAsset({
        owner,
        repo: repoName,
        release_id: release.data.id,
        name: attachment.fileName,
        data: data as any,
        headers: { 'content-type': attachment.contentType, 'content-length': data.length },
      }),
    );
    console.log(`Uploaded ${attachment.fileName}`);
  };

  await Promise.all(attachments.map((attachment) => upload(attachment)));
}

(async () => {
  const isDev = process.env.NODE_ENV === 'development';
  const { version, androidVersion, latestVersion } = await getVersions();

  if (semver.gt(version, latestVersion)) {
    // Set android version
    execSync(`npx capacitor-set-version set:android -v ${version} -b ${androidVersion}`, { stdio: 'inherit' });

    // Build source code
    execSync('yarn build:android', { stdio: 'inherit', env: process.env });

    // Generate changelog
    const changelog = !isDev ? await generateChangelog(latestVersion) : '';

    // Prepare attachments
    const attachments = await getFiles();

    // Create release
    await createRelease(version, changelog, attachments);
  }
})().catch((error) => {
  console.error('Release script failed:', error);
  process.exit(1);
});

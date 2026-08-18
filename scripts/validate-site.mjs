import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ignoredDirectories = new Set(['.git', 'node_modules']);
const htmlFiles = [];
const errors = [];

function collectHtmlFiles(directory) {
    for (const entry of readdirSync(directory)) {
        if (ignoredDirectories.has(entry)) continue;

        const absolutePath = join(directory, entry);
        if (statSync(absolutePath).isDirectory()) {
            collectHtmlFiles(absolutePath);
        } else if (extname(entry).toLowerCase() === '.html') {
            htmlFiles.push(absolutePath);
        }
    }
}

function resolveLocalReference(htmlFile, reference) {
    const cleanReference = reference.split('#')[0].split('?')[0];
    if (!cleanReference) return null;

    const decodedReference = decodeURIComponent(cleanReference);
    const absoluteTarget = decodedReference.startsWith('/')
        ? resolve(repositoryRoot, `.${decodedReference}`)
        : resolve(dirname(htmlFile), decodedReference);

    if (decodedReference.endsWith('/')) return join(absoluteTarget, 'index.html');
    return normalize(absoluteTarget);
}

function validateHtmlFile(htmlFile) {
    const source = readFileSync(htmlFile, 'utf8');
    const relativeFile = htmlFile.slice(repositoryRoot.length + 1);

    if (!/<title>[^<]+<\/title>/i.test(source)) {
        errors.push(`${relativeFile}: missing a non-empty <title>`);
    }

    if (!/<meta\s+name=["']description["'][^>]+content=["'][^"']+["']/i.test(source)) {
        errors.push(`${relativeFile}: missing a meta description`);
    }

    const referencePattern = /(?:href|src)=["']([^"']+)["']/gi;
    for (const match of source.matchAll(referencePattern)) {
        const reference = match[1];
        if (/^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(reference)) continue;

        const target = resolveLocalReference(htmlFile, reference);
        if (target && !existsSync(target)) {
            errors.push(`${relativeFile}: broken local reference "${reference}"`);
        }
    }
}

collectHtmlFiles(repositoryRoot);
htmlFiles.forEach(validateHtmlFile);

for (const requiredFile of ['feed.xml', 'robots.txt', 'sitemap.xml']) {
    if (!existsSync(join(repositoryRoot, requiredFile))) {
        errors.push(`Missing required file: ${requiredFile}`);
    }
}

if (errors.length > 0) {
    console.error('Site validation failed:');
    errors.forEach(error => console.error(`- ${error}`));
    process.exit(1);
}

console.log(`Site validation passed for ${htmlFiles.length} HTML files.`);

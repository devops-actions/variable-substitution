import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

test('the published action tree contains no symlinks that the runner must stage', () => {
    const ref = process.env.ACTION_TEST_REF || 'HEAD';
    const commit = execFileSync('git', [
        'rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`
    ], { encoding: 'utf8' }).trim();
    // Inspect Git objects, not Windows checkout files or npm's regenerated shims.
    const tree = execFileSync('git', ['ls-tree', '-r', '-z', commit], {
        encoding: 'utf8',
        maxBuffer: 16 * 1024 * 1024
    });
    const symlinks = tree.split('\0')
        .filter(entry => entry.startsWith('120000 '))
        .map(entry => entry.slice(entry.indexOf('\t') + 1));

    assert.deepEqual(symlinks, [],
        `Action download regression at ${commit}: symlinks cannot be staged on Linux/macOS:\n${symlinks.join('\n')}`);
});

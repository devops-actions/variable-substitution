import { strict as assert } from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { findfiles } from '../operations/utility.js';
describe('Test findfiles', () => {
    let workspace;
    let originalWorkspace;
    const files = [
        'appsettings.json',
        'config/app.json',
        'config/app.yaml',
        'config/nested/deep.json',
        'web/Web.config',
        'web/a1.config',
        'web/a2.config'
    ];
    const sorted = (list) => [...list].map(f => path.normalize(f)).sort();
    const inWorkspace = (...relative) => relative.map(r => path.join(workspace, r));
    before(() => {
        workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'varsub-find-'));
        for (const file of files) {
            const fullPath = path.join(workspace, file);
            fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            fs.writeFileSync(fullPath, '{}');
        }
        originalWorkspace = process.env.GITHUB_WORKSPACE;
        process.env.GITHUB_WORKSPACE = workspace;
    });
    after(() => {
        if (originalWorkspace === undefined) {
            delete process.env.GITHUB_WORKSPACE;
        }
        else {
            process.env.GITHUB_WORKSPACE = originalWorkspace;
        }
        fs.rmSync(workspace, { recursive: true, force: true });
    });
    describe('literal paths', () => {
        it('returns an existing file as-is', () => {
            const file = path.join(workspace, 'config', 'app.json');
            assert.deepStrictEqual(findfiles(file), [file]);
        });
        it('returns an empty list for a missing file', () => {
            assert.deepStrictEqual(findfiles(path.join(workspace, 'does-not-exist.json')), []);
        });
    });
    describe('glob patterns (relative to GITHUB_WORKSPACE)', () => {
        it('matches files in a single directory with *', () => {
            assert.deepStrictEqual(sorted(findfiles('config/*.json')), sorted(inWorkspace('config/app.json')));
        });
        it('matches files recursively with **', () => {
            assert.deepStrictEqual(sorted(findfiles('**/*.json')), sorted(inWorkspace('appsettings.json', 'config/app.json', 'config/nested/deep.json')));
        });
        it('matches a single character with ?', () => {
            assert.deepStrictEqual(sorted(findfiles('web/a?.config')), sorted(inWorkspace('web/a1.config', 'web/a2.config')));
        });
        it('handles a pattern mixing ? and * where ? comes first', () => {
            assert.deepStrictEqual(sorted(findfiles('web/a?.*')), sorted(inWorkspace('web/a1.config', 'web/a2.config')));
        });
        it('handles a pattern mixing ? and * where * comes first', () => {
            assert.deepStrictEqual(sorted(findfiles('config/*/dee?.json')), sorted(inWorkspace('config/nested/deep.json')));
        });
        it('returns an empty list when nothing matches', () => {
            assert.deepStrictEqual(findfiles('**/*.xml'), []);
        });
        it('returns an empty list when the search root does not exist', () => {
            assert.deepStrictEqual(findfiles('missing-dir/*.json'), []);
        });
    });
});
//# sourceMappingURL=utility.test.js.map
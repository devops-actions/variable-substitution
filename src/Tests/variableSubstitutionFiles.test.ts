import { strict as assert } from 'assert';

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as yaml from 'js-yaml';
import sinon from 'sinon';

import { VariableSubstitution } from '../variableSubstitution.js';

// End-to-end tests for VariableSubstitution: every test works on its own temporary file,
// so the committed resources in src/Tests/Resources are never modified.
describe('Test variable substitution on files', () => {
    let tempDir: string;
    let logStub: sinon.SinonStub;
    const setEnvVars: string[] = [];

    const setEnv = (key: string, value: string) => {
        process.env[key] = value;
        setEnvVars.push(key);
    };

    const writeTemp = (name: string, content: string | Buffer) => {
        const file = path.join(tempDir, name);
        fs.writeFileSync(file, content);
        return file;
    };

    const substitute = (...files: string[]) => new VariableSubstitution().segregateFilesAndSubstitute(files);

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'varsub-'));
        logStub = sinon.stub(console, 'log');
    });

    afterEach(() => {
        logStub.restore();
        while (setEnvVars.length) {
            delete process.env[setEnvVars.pop()];
        }
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    describe('JSON', () => {
        it('substitutes nested keys and writes the file', () => {
            setEnv('varsubJson.database.name', 'production-db');
            const file = writeTemp('app.json', JSON.stringify({ varsubJson: { database: { name: 'local-db', port: 5432 } } }));

            substitute(file);

            const result = JSON.parse(fs.readFileSync(file, 'utf8'));
            assert.strictEqual(result.varsubJson.database.name, 'production-db');
            assert.strictEqual(result.varsubJson.database.port, 5432);
            assert.ok(logStub.calledWith(`Successfully updated file: ${file}`));
        });

        it('keeps a UTF-8 BOM on the rewritten file', () => {
            setEnv('varsubBom', 'new');
            const file = writeTemp('bom.json', Buffer.concat([Buffer.from([0xEF, 0xBB, 0xBF]), Buffer.from('{"varsubBom": "old"}')]));

            substitute(file);

            const written = fs.readFileSync(file);
            assert.deepStrictEqual([...written.subarray(0, 3)], [0xEF, 0xBB, 0xBF]);
            assert.strictEqual(JSON.parse(written.subarray(3).toString()).varsubBom, 'new');
        });

        it('accepts JSON with single-line and multi-line comments', () => {
            setEnv('varsubComments.value', 'replaced');
            const file = writeTemp('comments.json', [
                '{',
                '    // single line comment',
                '    "varsubComments": {',
                '        /* multi',
                '           line comment */',
                '        "value": "original",',
                '        "url": "https://example.com/path", // trailing comment',
                '        "escaped": "quote \\" // not a comment"',
                '    }',
                '}'
            ].join('\r\n'));

            substitute(file);

            const result = JSON.parse(fs.readFileSync(file, 'utf8'));
            assert.deepStrictEqual(result.varsubComments, {
                value: 'replaced',
                url: 'https://example.com/path',
                escaped: 'quote " // not a comment'
            });
        });

        it('throws and leaves the file untouched when no variable matches', () => {
            const content = '{"varsubNoMatch": "unchanged"}';
            const file = writeTemp('nomatch.json', content);

            assert.throws(() => substitute(file), /Failed to apply variable substitution/);
            assert.strictEqual(fs.readFileSync(file, 'utf8'), content);
            assert.ok(logStub.calledWith('Skipped updating file: ' + file));
        });
    });

    describe('XML', () => {
        const webConfig = [
            '<?xml version="1.0" encoding="utf-8"?>',
            '<configuration>',
            '  <appSettings>',
            '    <add key="varsubSetting" value="old" />',
            '    <add key="untouched" value="it\'s fine" />',
            '  </appSettings>',
            '  <connectionStrings>',
            '    <add name="varsubDb" connectionString="Server=old" />',
            '  </connectionStrings>',
            '</configuration>'
        ].join('\n');

        it('substitutes app settings and connection strings, keeping the header', () => {
            setEnv('varsubSetting', 'say "hi"');
            setEnv('varsubDb', 'Server=prod;Database=app');
            const file = writeTemp('Web.config', webConfig);

            substitute(file);

            const written = fs.readFileSync(file, 'utf8');
            assert.ok(written.startsWith('<?xml version="1.0" encoding="utf-8"?>\n'));
            // double quotes in values are converted to single quotes so the attribute stays valid
            assert.ok(written.includes('<add key="varsubSetting" value="say \'hi\'"/>'), written);
            assert.ok(written.includes('connectionString="Server=prod;Database=app"'), written);
            // apostrophes in untouched attributes must survive the round trip unescaped
            assert.ok(written.includes('value="it\'s fine"'), written);
            assert.ok(!written.includes('CONFIG_FILE_'), 'no substitution tokens should remain');
            assert.ok(!written.includes('APOS_CHARACTER_TOKEN'), 'no apostrophe tokens should remain');
        });

        it('throws and leaves the file untouched when no variable matches', () => {
            const file = writeTemp('Web.config', webConfig);

            assert.throws(() => substitute(file), /Failed to apply variable substitution/);
            assert.strictEqual(fs.readFileSync(file, 'utf8'), webConfig);
        });
    });

    describe('YAML', () => {
        it('substitutes nested keys and writes the file', () => {
            setEnv('varsubYaml.server.host', 'prod.example.com');
            const file = writeTemp('config.yaml', 'varsubYaml:\n  server:\n    host: localhost\n    port: 8080\n');

            substitute(file);

            const result = yaml.load(fs.readFileSync(file, 'utf8')) as any;
            assert.deepStrictEqual(result.varsubYaml.server, { host: 'prod.example.com', port: 8080 });
            assert.ok(logStub.calledWith(`Successfully updated config file: ${file}`));
        });

        it('throws and leaves the file untouched when no variable matches', () => {
            const content = 'varsubYamlNoMatch: value\n';
            const file = writeTemp('nomatch.yaml', content);

            assert.throws(() => substitute(file), /Failed to apply variable substitution/);
            assert.strictEqual(fs.readFileSync(file, 'utf8'), content);
        });
    });

    describe('file handling', () => {
        it('reports a parse error per format for a file that is not JSON, XML or YAML', () => {
            const file = writeTemp('broken.yml', 'key: value\n bad-indent: [unclosed\n');

            assert.throws(() => substitute(file), (err: Error) => {
                assert.match(err.message, /Could not parse file/);
                assert.match(err.message, /JSON parse error/);
                assert.match(err.message, /XML parse error/);
                assert.match(err.message, /YAML parse error/);
                return true;
            });
        });

        it('skips patterns without matches and still processes the other files', () => {
            setEnv('varsubMulti', 'updated');
            const file = writeTemp('multi.json', '{"varsubMulti": "old"}');

            substitute(path.join(tempDir, 'missing.json'), ` ${file} `);

            assert.strictEqual(JSON.parse(fs.readFileSync(file, 'utf8')).varsubMulti, 'updated');
        });

        it('throws when none of the given files exist', () => {
            assert.throws(() => substitute(path.join(tempDir, 'missing.json')), /Failed to apply variable substitution/);
        });
    });

    describe('run', () => {
        it('reads the comma separated files input', async () => {
            setEnv('varsubRun', 'from-input');
            const first = writeTemp('first.json', '{"varsubRun": "old"}');
            const second = writeTemp('second.yaml', 'varsubRun: old\n');
            setEnv('INPUT_FILES', `${first},${second}`);

            await new VariableSubstitution().run();

            assert.strictEqual(JSON.parse(fs.readFileSync(first, 'utf8')).varsubRun, 'from-input');
            assert.strictEqual((yaml.load(fs.readFileSync(second, 'utf8')) as any).varsubRun, 'from-input');
        });

        it('fails when the files input is missing', async () => {
            delete process.env.INPUT_FILES;
            await assert.rejects(() => new VariableSubstitution().run(), /Input required and not supplied: files/);
        });
    });
});

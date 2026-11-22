import { strict as assert } from 'assert';

import { detectFileEncoding } from '../operations/fileEncodingUtility.js';

describe('Test file encoding detection', () => {

    describe('files with a BOM', () => {
        it('detects UTF-8 with BOM', () => {
            const buffer = Buffer.concat([Buffer.from([0xEF, 0xBB, 0xBF]), Buffer.from('{"a":1}')]);
            assert.deepStrictEqual(detectFileEncoding('utf8bom.json', buffer), { encoding: 'utf-8', withBOM: true });
        });

        it('detects UTF-16LE with BOM', () => {
            const buffer = Buffer.concat([Buffer.from([0xFF, 0xFE]), Buffer.from('{"a":1}', 'utf16le')]);
            assert.deepStrictEqual(detectFileEncoding('utf16le-bom.json', buffer), { encoding: 'utf-16le', withBOM: true });
        });

        it('rejects UTF-32LE with BOM', () => {
            const buffer = Buffer.from([0xFF, 0xFE, 0x00, 0x00, 0x7B, 0x00, 0x00, 0x00]);
            assert.throws(() => detectFileEncoding('utf32le.json', buffer), /UTF-32LE/);
        });

        it('rejects a FE FF (big endian) BOM', () => {
            const buffer = Buffer.from([0xFE, 0xFF, 0x00, 0x7B, 0x00, 0x7D]);
            assert.throws(() => detectFileEncoding('be.json', buffer), /not supported/);
        });

        it('rejects UTF-32BE with BOM', () => {
            const buffer = Buffer.from([0x00, 0x00, 0xFE, 0xFF, 0x00, 0x00, 0x00, 0x7B]);
            assert.throws(() => detectFileEncoding('utf32be.json', buffer), /UTF-32BE/);
        });
    });

    describe('files without a BOM', () => {
        it('detects plain UTF-8', () => {
            assert.deepStrictEqual(detectFileEncoding('plain.json', Buffer.from('{"a":1}')), { encoding: 'utf-8', withBOM: false });
        });

        it('detects UTF-16LE without BOM', () => {
            assert.deepStrictEqual(detectFileEncoding('utf16le.json', Buffer.from('{"a":1}', 'utf16le')), { encoding: 'utf-16le', withBOM: false });
        });

        it('rejects UTF-16BE without BOM', () => {
            const buffer = Buffer.from([0x00, 0x7B, 0x00, 0x22]);
            assert.throws(() => detectFileEncoding('utf16be.json', buffer), /UTF-16BE/);
        });

        it('rejects UTF-32BE without BOM', () => {
            const buffer = Buffer.from([0x00, 0x00, 0x00, 0x7B]);
            assert.throws(() => detectFileEncoding('utf32be.json', buffer), /UTF-32BE/);
        });

        it('rejects UTF-32LE without BOM', () => {
            const buffer = Buffer.from([0x7B, 0x00, 0x00, 0x00]);
            assert.throws(() => detectFileEncoding('utf32le.json', buffer), /UTF-32LE/);
        });

        it('rejects an unrecognised byte pattern', () => {
            const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
            assert.throws(() => detectFileEncoding('zeros.bin', buffer), /Unable to detect encoding.*typeCode: 0/);
        });
    });

    it('rejects a buffer that is too short to inspect', () => {
        assert.throws(() => detectFileEncoding('tiny.json', Buffer.from('{}')), /too short/);
    });
});

import { JsonSubstitution } from '../operations/jsonVariableSubstitutionUtility';
import { VariableSubstitution } from "../variableSubstitution";
import { XmlSubstitution } from '../operations/xmlVariableSubstitution';
import { strict as assert } from 'assert';

import * as path from 'path';
import sinon from "sinon";

describe("Test variable substitution main", () => {
    const resourcesDir = path.resolve(__dirname, '../../src/Tests/Resources');
    var spy, JsonSubstitutionMock, XmlSubstitutionMock;
    before(() => {
        spy = sinon.spy(console, "log");
        JsonSubstitutionMock = sinon.mock(JsonSubstitution);
        XmlSubstitutionMock = sinon.mock(XmlSubstitution);
    });

    after(() => {        
        JsonSubstitutionMock.restore();
        XmlSubstitutionMock.restore();
        spy.restore();
    });

    it("Valid XML", () => {
        let file = path.join(resourcesDir, "Web.config");
        let filesArr = file.split(",");
        let varSub = new VariableSubstitution();
        try {
            varSub.segregateFilesAndSubstitute(filesArr);
        }
        catch(e) {
        }
        assert.strictEqual(spy.calledWith("Applying variable substitution on XML file: " + file), true);
    });

    it("Valid JSON", () => {
        let file = path.join(resourcesDir, "test.json");
        let filesArr = file.split(",");
        let varSub = new VariableSubstitution();
        try {
            varSub.segregateFilesAndSubstitute(filesArr);
        }
        catch(e) {
        }
        assert.strictEqual(spy.calledWith("Applying variable substitution on JSON file: " + file), true);
    });

    it("Invalid JSON", () => {
        let file = path.join(resourcesDir, "Wrong_test.json");
        let filesArr = file.split(",");
        let varSub = new VariableSubstitution();
        try {
            varSub.segregateFilesAndSubstitute(filesArr);
        }
        catch(e) {
        }
        assert.strictEqual(spy.calledWith("Applying variable substitution on JSON file: " + file), false);
    });

    it("Valid YAML", () => {
        let file = path.join(resourcesDir, "test.yaml");
        let filesArr = file.split(",");
        let varSub = new VariableSubstitution();
        try {
            varSub.segregateFilesAndSubstitute(filesArr);
        }
        catch(e) {
        }
        assert.strictEqual(spy.calledWith("Applying variable substitution on YAML file: " + file), true);
    });

    it("Invalid YAML", () => {
        let file = path.join(resourcesDir, "Wrong_test.yml");
        let filesArr = file.split(",");
        let varSub = new VariableSubstitution();
        try {
            varSub.segregateFilesAndSubstitute(filesArr);
        }
        catch(e) {
        }
        assert.strictEqual(spy.calledWith("Applying variable substitution on YAML file: " + file), false);
    });    
});
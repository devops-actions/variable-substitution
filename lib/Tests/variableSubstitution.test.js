"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonVariableSubstitutionUtility_1 = require("../operations/jsonVariableSubstitutionUtility");
const variableSubstitution_1 = require("../variableSubstitution");
const xmlVariableSubstitution_1 = require("../operations/xmlVariableSubstitution");
const assert_1 = require("assert");
const path = __importStar(require("path"));
const sinon_1 = __importDefault(require("sinon"));
describe("Test variable substitution main", () => {
    const resourcesDir = path.resolve(__dirname, '../../src/Tests/Resources');
    var spy, JsonSubstitutionMock, XmlSubstitutionMock;
    before(() => {
        spy = sinon_1.default.spy(console, "log");
        JsonSubstitutionMock = sinon_1.default.mock(jsonVariableSubstitutionUtility_1.JsonSubstitution);
        XmlSubstitutionMock = sinon_1.default.mock(xmlVariableSubstitution_1.XmlSubstitution);
    });
    after(() => {
        JsonSubstitutionMock.restore();
        XmlSubstitutionMock.restore();
        spy.restore();
    });
    it("Valid XML", () => {
        let file = path.join(resourcesDir, "Web.config");
        let filesArr = file.split(",");
        let varSub = new variableSubstitution_1.VariableSubstitution();
        try {
            varSub.segregateFilesAndSubstitute(filesArr);
        }
        catch (e) {
        }
        assert_1.strict.strictEqual(spy.calledWith("Applying variable substitution on XML file: " + file), true);
    });
    it("Valid JSON", () => {
        let file = path.join(resourcesDir, "test.json");
        let filesArr = file.split(",");
        let varSub = new variableSubstitution_1.VariableSubstitution();
        try {
            varSub.segregateFilesAndSubstitute(filesArr);
        }
        catch (e) {
        }
        assert_1.strict.strictEqual(spy.calledWith("Applying variable substitution on JSON file: " + file), true);
    });
    it("Invalid JSON", () => {
        let file = path.join(resourcesDir, "Wrong_test.json");
        let filesArr = file.split(",");
        let varSub = new variableSubstitution_1.VariableSubstitution();
        try {
            varSub.segregateFilesAndSubstitute(filesArr);
        }
        catch (e) {
        }
        assert_1.strict.strictEqual(spy.calledWith("Applying variable substitution on JSON file: " + file), false);
    });
    it("Valid YAML", () => {
        let file = path.join(resourcesDir, "test.yaml");
        let filesArr = file.split(",");
        let varSub = new variableSubstitution_1.VariableSubstitution();
        try {
            varSub.segregateFilesAndSubstitute(filesArr);
        }
        catch (e) {
        }
        assert_1.strict.strictEqual(spy.calledWith("Applying variable substitution on YAML file: " + file), true);
    });
    it("Invalid YAML", () => {
        let file = path.join(resourcesDir, "Wrong_test.yml");
        let filesArr = file.split(",");
        let varSub = new variableSubstitution_1.VariableSubstitution();
        try {
            varSub.segregateFilesAndSubstitute(filesArr);
        }
        catch (e) {
        }
        assert_1.strict.strictEqual(spy.calledWith("Applying variable substitution on YAML file: " + file), false);
    });
});

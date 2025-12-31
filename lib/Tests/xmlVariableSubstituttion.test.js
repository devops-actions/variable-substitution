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
const envVarUtility = __importStar(require("../operations/envVariableUtility"));
const xmlDomUtility_1 = require("../operations/xmlDomUtility");
const xmlVariableSubstitution_1 = require("../operations/xmlVariableSubstitution");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sinon_1 = __importDefault(require("sinon"));
const chai_1 = require("chai");
describe('Test Xml Variable Substitution', () => {
    const resourcesDir = path.resolve(__dirname, '../../src/Tests/Resources');
    it("Should substitute", () => {
        let envVarUtilityMock = sinon_1.default.mock(envVarUtility);
        envVarUtilityMock.expects('getVariableMap').returns(new Map([
            ['conntype', 'new_connType'],
            ['MyDB', 'TestDB'],
            ['webpages:Version', '1.1.7.3'],
            ['xdt:Transform', 'DelAttributes'],
            ['xdt:Locator', 'Match(tag)'],
            ['DefaultConnection', "Url=https://primary;Database=db1;ApiKey=11111111-1111-1111-1111-111111111111;Failover = {Url:'https://secondary', ApiKey:'11111111-1111-1111-1111-111111111111'}"],
            ['OtherDefaultConnection', 'connectionStringValue2'],
            ['ParameterConnection', 'New_Connection_String From xml var subs'],
            ['connectionString', 'replaced_value'],
            ['invariantName', 'System.Data.SqlServer'],
            ['blatvar', 'ApplicationSettingReplacedValue'],
            ['log_level', 'error,warning'],
            ['Email:ToOverride', '']
        ]));
        function replaceEscapeXMLCharacters(xmlDOMNode) {
            if (!xmlDOMNode || typeof xmlDOMNode == 'string') {
                return;
            }
            for (var xmlAttribute in xmlDOMNode.attrs) {
                xmlDOMNode.attrs[xmlAttribute] = xmlDOMNode.attrs[xmlAttribute].replace(/'/g, "APOS_CHARACTER_TOKEN");
            }
            for (var xmlChild of xmlDOMNode.children) {
                replaceEscapeXMLCharacters(xmlChild);
            }
        }
        let source = path.join(resourcesDir, "Web.config");
        let fileBuffer = fs.readFileSync(source);
        let fileContent = fileBuffer.toString('utf-8');
        let xmlDomUtilityInstance = new xmlDomUtility_1.XmlDomUtility(fileContent);
        let xmlSubstitution = new xmlVariableSubstitution_1.XmlSubstitution(xmlDomUtilityInstance);
        let isApplied = xmlSubstitution.substituteXmlVariables();
        (0, chai_1.expect)(isApplied).to.equal(true);
        let xmlDocument = xmlDomUtilityInstance.getXmlDom();
        replaceEscapeXMLCharacters(xmlDocument);
        let domContent = '\uFEFF' + xmlDomUtilityInstance.getContentWithHeader(xmlDocument);
        for (let replacableTokenValue in xmlSubstitution.replacableTokenValues) {
            domContent = domContent.split(replacableTokenValue).join(xmlSubstitution.replacableTokenValues[replacableTokenValue]);
        }
        let expectedResult = path.join(resourcesDir, "Web_Expected.config");
        fileBuffer = fs.readFileSync(expectedResult);
        let expectedContent = fileBuffer.toString('utf-8');
        let targetXmlDomUtilityInstance = new xmlDomUtility_1.XmlDomUtility(expectedContent);
        let expectedXmlDocument = targetXmlDomUtilityInstance.getXmlDom();
        replaceEscapeXMLCharacters(expectedXmlDocument);
        let expectedDomContent = '\uFEFF' + xmlDomUtilityInstance.getContentWithHeader(expectedXmlDocument);
        expectedDomContent = expectedDomContent.split("APOS_CHARACTER_TOKEN").join("'");
        (0, chai_1.expect)(domContent).to.equal(expectedDomContent);
    });
});

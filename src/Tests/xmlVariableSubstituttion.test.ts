import * as envVarUtility from "../operations/envVariableUtility";

import { XmlDomUtility } from "../operations/xmlDomUtility";
import { XmlSubstitution } from "../operations/xmlVariableSubstitution";

import * as fs from 'fs';
import * as path from 'path';
import sinon from "sinon";
import { strict as assert } from 'assert';

describe('Test Xml Variable Substitution', () => {
    const resourcesDir = path.resolve(__dirname, '../../src/Tests/Resources');
    it("Should substitute", () => {
        let envVarUtilityMock = sinon.mock(envVarUtility);
        envVarUtilityMock.expects('getVariableMap').returns(
            new Map([
                ['conntype', 'new_connType'],
                ['MyDB', 'TestDB'],
                ['webpages:Version' , '1.1.7.3'],
                ['xdt:Transform' , 'DelAttributes'],
                ['xdt:Locator' , 'Match(tag)'],
                ['DefaultConnection', "Url=https://primary;Database=db1;ApiKey=11111111-1111-1111-1111-111111111111;Failover = {Url:'https://secondary', ApiKey:'11111111-1111-1111-1111-111111111111'}"],
                ['OtherDefaultConnection', 'connectionStringValue2'],
                ['ParameterConnection', 'New_Connection_String From xml var subs'],
                ['connectionString', 'replaced_value'],
                ['invariantName', 'System.Data.SqlServer'],
                ['blatvar', 'ApplicationSettingReplacedValue'],
                ['log_level', 'error,warning'],
                ['Email:ToOverride', '']
            ])
        );

        function replaceEscapeXMLCharacters(xmlDOMNode) {
            if(!xmlDOMNode || typeof xmlDOMNode == 'string') {
                return;
            }
        
            for(var xmlAttribute in xmlDOMNode.attrs) {
                xmlDOMNode.attrs[xmlAttribute] = xmlDOMNode.attrs[xmlAttribute].replace(/'/g, "APOS_CHARACTER_TOKEN");
            }
        
            for(var xmlChild of xmlDOMNode.children) {
                replaceEscapeXMLCharacters(xmlChild);
            }
        }
        let source = path.join(resourcesDir, "Web.config");
        let fileBuffer: Buffer = fs.readFileSync(source);
        let fileContent: string = fileBuffer.toString('utf-8');
        let xmlDomUtilityInstance = new XmlDomUtility(fileContent);
        let xmlSubstitution = new XmlSubstitution(xmlDomUtilityInstance);
        let isApplied = xmlSubstitution.substituteXmlVariables();
        assert.strictEqual(isApplied, true);
        
        let xmlDocument = xmlDomUtilityInstance.getXmlDom();
        replaceEscapeXMLCharacters(xmlDocument);
        let domContent = '\uFEFF' + xmlDomUtilityInstance.getContentWithHeader(xmlDocument);
        for(let replacableTokenValue in xmlSubstitution.replacableTokenValues) {
            domContent = domContent.split(replacableTokenValue).join(xmlSubstitution.replacableTokenValues[replacableTokenValue]);
        }

        let expectedResult = path.join(resourcesDir, "Web_Expected.config");
        fileBuffer = fs.readFileSync(expectedResult);
        let expectedContent: string = fileBuffer.toString('utf-8');
        let targetXmlDomUtilityInstance = new XmlDomUtility(expectedContent);
        let expectedXmlDocument = targetXmlDomUtilityInstance.getXmlDom();
        replaceEscapeXMLCharacters(expectedXmlDocument);
        let expectedDomContent = '\uFEFF' + xmlDomUtilityInstance.getContentWithHeader(expectedXmlDocument);
        expectedDomContent = expectedDomContent.split("APOS_CHARACTER_TOKEN").join("'");
        assert.strictEqual(domContent, expectedDomContent);
    });
});
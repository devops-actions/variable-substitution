"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sinon_1 = __importDefault(require("sinon"));
const chai_1 = require("chai");
const envVariableUtility_1 = require("../operations/envVariableUtility");
const jsonVariableSubstitutionUtility_1 = require("../operations/jsonVariableSubstitutionUtility");
describe('Test JSON Variable Substitution', () => {
    var jsonObject, isApplied;
    before(() => {
        let stub = sinon_1.default.stub(envVariableUtility_1.EnvTreeUtility, "getEnvVarTree").callsFake(() => {
            let envVariables = new Map([
                ['system.debug', 'true'],
                ['data.ConnectionString', 'database_connection'],
                ['data.userName', 'db_admin'],
                ['data.password', 'db_pass'],
                ['&pl.ch@r@cter.k^y', '*.config'],
                ['build.sourceDirectory', 'DefaultWorkingDirectory'],
                ['user.profile.name.first', 'firstName'],
                ['user.profile', 'replace_all'],
                ['constructor.name', 'newConstructorName'],
                ['constructor.valueOf', 'constructorNewValue'],
                ['profile.users', '["suaggar","rok","asranja", "chaitanya"]'],
                ['profile.enabled', 'false'],
                ['profile.version', '1173'],
                ['profile.somefloat', '97.75'],
                ['profile.preimum_level', '{"suaggar": "V4", "rok": "V5", "asranja": { "type" : "V6"}}']
            ]);
            let envVarTree = {
                value: null,
                isEnd: false,
                child: {
                    '__proto__': null
                }
            };
            for (let [key, value] of envVariables.entries()) {
                if (!(0, envVariableUtility_1.isPredefinedVariable)(key)) {
                    let envVarTreeIterator = envVarTree;
                    let envVariableNameArray = key.split('.');
                    for (let variableName of envVariableNameArray) {
                        if (envVarTreeIterator.child[variableName] === undefined || typeof envVarTreeIterator.child[variableName] === 'function') {
                            envVarTreeIterator.child[variableName] = {
                                value: null,
                                isEnd: false,
                                child: {}
                            };
                        }
                        envVarTreeIterator = envVarTreeIterator.child[variableName];
                    }
                    envVarTreeIterator.isEnd = true;
                    envVarTreeIterator.value = value;
                }
            }
            return envVarTree;
        });
        jsonObject = {
            'User.Profile': 'do_not_replace',
            'data': {
                'ConnectionString': 'connect_string',
                'userName': 'name',
                'password': 'pass'
            },
            '&pl': {
                'ch@r@cter.k^y': 'v@lue'
            },
            'system': {
                'debug': 'no_change'
            },
            'user.profile': {
                'name.first': 'fname'
            },
            'constructor.name': 'myconstructorname',
            'constructor': {
                'name': 'myconstructorname',
                'valueOf': 'myconstructorvalue'
            },
            'profile': {
                'users': ['arjgupta', 'raagra', 'muthuk'],
                'preimum_level': {
                    'arjgupta': 'V1',
                    'raagra': 'V2',
                    'muthuk': {
                        'type': 'V3'
                    }
                },
                "enabled": true,
                "version": 2,
                "somefloat": 2.3456
            }
        };
        let jsonSubsitution = new jsonVariableSubstitutionUtility_1.JsonSubstitution();
        isApplied = jsonSubsitution.substituteJsonVariable(jsonObject, envVariableUtility_1.EnvTreeUtility.getEnvVarTree());
        stub.restore();
    });
    it("Should substitute", () => {
        console.log(JSON.stringify(jsonObject));
        (0, chai_1.expect)(isApplied).to.equal(true);
    });
    it("Validate simple string change", () => {
        (0, chai_1.expect)(jsonObject['data']['ConnectionString']).to.equal('database_connection');
        (0, chai_1.expect)(jsonObject['data']['userName']).to.equal('db_admin');
    });
    it("Validate system variable elimination", () => {
        (0, chai_1.expect)(jsonObject['system']['debug']).to.equal('no_change');
    });
    it("Validate special variables", () => {
        (0, chai_1.expect)(jsonObject['&pl']['ch@r@cter.k^y']).to.equal('*.config');
    });
    it("Validate case sensitive variables", () => {
        (0, chai_1.expect)(jsonObject['User.Profile']).to.equal('do_not_replace');
    });
    it("Validate inbuilt JSON attributes substitution", () => {
        (0, chai_1.expect)(jsonObject['constructor.name']).to.equal('newConstructorName');
        (0, chai_1.expect)(jsonObject['constructor']['name']).to.equal('newConstructorName');
        (0, chai_1.expect)(jsonObject['constructor']['valueOf']).to.equal('constructorNewValue');
    });
    it("Validate Array Object", () => {
        (0, chai_1.expect)(jsonObject['profile']['users'].length).to.equal(4);
        let newArray = ["suaggar", "rok", "asranja", "chaitanya"];
        (0, chai_1.expect)(jsonObject['profile']['users']).to.deep.equal(newArray);
    });
    it("Validate Boolean", () => {
        (0, chai_1.expect)(jsonObject['profile']['enabled']).to.equal(false);
    });
    it("Validate Number(float)", () => {
        (0, chai_1.expect)(jsonObject['profile']['somefloat']).to.equal(97.75);
    });
    it("Validate Number(int)", () => {
        (0, chai_1.expect)(jsonObject['profile']['version']).to.equal(1173);
    });
    it("Validate Object", () => {
        (0, chai_1.expect)(jsonObject['profile']['preimum_level']).to.deep.equal({ "suaggar": "V4", "rok": "V5", "asranja": { "type": "V6" } });
    });
});

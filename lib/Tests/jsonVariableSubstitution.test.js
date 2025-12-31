"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sinon_1 = __importDefault(require("sinon"));
const assert_1 = require("assert");
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
        assert_1.strict.strictEqual(isApplied, true);
    });
    it("Validate simple string change", () => {
        assert_1.strict.strictEqual(jsonObject['data']['ConnectionString'], 'database_connection');
        assert_1.strict.strictEqual(jsonObject['data']['userName'], 'db_admin');
    });
    it("Validate system variable elimination", () => {
        assert_1.strict.strictEqual(jsonObject['system']['debug'], 'no_change');
    });
    it("Validate special variables", () => {
        assert_1.strict.strictEqual(jsonObject['&pl']['ch@r@cter.k^y'], '*.config');
    });
    it("Validate case sensitive variables", () => {
        assert_1.strict.strictEqual(jsonObject['User.Profile'], 'do_not_replace');
    });
    it("Validate inbuilt JSON attributes substitution", () => {
        assert_1.strict.strictEqual(jsonObject['constructor.name'], 'newConstructorName');
        assert_1.strict.strictEqual(jsonObject['constructor']['name'], 'newConstructorName');
        assert_1.strict.strictEqual(jsonObject['constructor']['valueOf'], 'constructorNewValue');
    });
    it("Validate Array Object", () => {
        assert_1.strict.strictEqual(jsonObject['profile']['users'].length, 4);
        let newArray = ["suaggar", "rok", "asranja", "chaitanya"];
        assert_1.strict.deepStrictEqual(jsonObject['profile']['users'], newArray);
    });
    it("Validate Boolean", () => {
        assert_1.strict.strictEqual(jsonObject['profile']['enabled'], false);
    });
    it("Validate Number(float)", () => {
        assert_1.strict.strictEqual(jsonObject['profile']['somefloat'], 97.75);
    });
    it("Validate Number(int)", () => {
        assert_1.strict.strictEqual(jsonObject['profile']['version'], 1173);
    });
    it("Validate Object", () => {
        assert_1.strict.deepStrictEqual(jsonObject['profile']['preimum_level'], { "suaggar": "V4", "rok": "V5", "asranja": { "type": "V6" } });
    });
});

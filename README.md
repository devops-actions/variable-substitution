# Forked from original (upstream has been archived)
This is a fork from [github.com/microsoft/variable-substitution](https://github.com/microsoft/variable-substitution), so that I could fix the 'node12 is being deprecated' warning. I'm keeping the dependencies up to date as well.

OpenSSF Scorecard setup for this repo: [![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/devops-actions/variable-substitution/badge)](https://api.securityscorecards.dev/projects/github.com/devops-actions/variable-substitution)

# GitHub Action for substituting variables in parameterized files ![.github/workflows/ci.yml](https://github.com/devops-actions/variable-substitution/workflows/.github/workflows/ci.yml/badge.svg?branch=master)

With the Variable Substitution Action for GitHub, you can apply variable substitution to XML, JSON ,and YAML based configuration and parameter files.

-	Tokens defined in the target configuration files are updated and then replaced with variable values.
-	Variable substitution is applied for only the JSON keys predefined in the object hierarchy. It does not create new keys.
-	Only variables defined explicitly as Environment variables as part of the workflow or system variables that are already available for workflow context can be used in substitution.
-	Variable substitution takes effect only on the `applicationSettings`, `appSettings`, `connectionStrings` and `configSections` elements of configuration files. Please refer [this](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/transforms-variable-substitution?view=azure-devops&tabs=Classic#xml-variable-substitution) for more information. 

If you are looking for more Github Actions to deploy code or a customized image into an Azure Webapp or a Kubernetes service, consider using [Azure Actions](https://github.com/Azure/actions).

The definition of this Github Action is in [action.yml](https://github.com/microsoft/variable-substitution/blob/master/action.yml).

### Example
See [Use variable substitution with GitHub Actions](https://docs.microsoft.com/en-us/azure/developer/github/github-variable-substitution) for an example of how to use variable substitution.

# End-to-End Sample Workflow

## Sample workflow to apply Variable substitution on XML, JSON, YML files

```yaml
# .github/workflows/var-substitution.yml
on: [push]
name: variable substitution in json, xml, and yml files

jobs:
  build:
    runs-on: windows-latest
    steps:
    - uses: actions/checkout@v2

    - uses: devops-actions/variable-substitution@v1.2
      with:
        files: 'Application/*.json, Application/*.yaml, ./Application/SampleWebApplication/We*.config'
      env:
        Var1: "value1"
        Var2.key1: "value2"
        SECRET: ${{ secrets.SOME_SECRET }}

 ```
# Contributing

## Action download regression

`node --test scripts/action-download.test.mjs` checks the committed Git tree for
symlinks, even on Windows or after `npm ci` has replaced the CLI shims. Set
`ACTION_TEST_REF` to a fetched commit to check that tree without checking it out
or executing its code. This check fails if the published tree contains symlinks.

The **Action download regression** workflow checks out the workflow's revision
and runs its action with `uses: ./` on Ubuntu latest, macOS, and Windows 2025.
For pull requests, this tests GitHub's PR merge revision; push and manual runs
test the triggering revision. Each job asserts nested JSON substitution and
preservation of an unrelated key without installing or rebuilding dependencies.
Local execution does not exercise remote archive staging, so the separate
published-tree check guards against the symlinks that caused staging failures.

Action code runs only in ephemeral GitHub-hosted jobs with read-only contents
permission, no secrets, persisted credentials, or caches.

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

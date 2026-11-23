# F04 — operator review

Observed main rules: ruleset `20121609` contributes a deletion rule; classic protection does not require status contexts. The main CI for `fcbcee5` reported `Workspace checks` from GitHub Actions app `15368`. The aggregate checks docs and scope unconditionally and permits only the skips specified by the selector. Validate this context on a docs-only and a full PR before applying.

Proposed change: create a separate active branch ruleset scoped only to `refs/heads/main`, requiring `Workspace checks` with integration ID `15368`. No bypass actors; no change to existing rules, publication permissions or versioning. Do not require individual conditional jobs. Before applying record the current effective rules, approval identity and timestamp; after applying query the effective rules, observe clean docs/full PRs and a failing selected job preventing merge on a disposable PR. Rollback: remove **only** the new ruleset by its recorded ID, then compare effective rules to the saved snapshot. This proposal is not authorization to change protection.

## Reviewed request

```json
{"name":"Required workspace checks","target":"branch","enforcement":"active","conditions":{"ref_name":{"include":["refs/heads/main"],"exclude":[]}},"bypass_actors":[],"rules":[{"type":"required_status_checks","parameters":{"strict_required_status_checks_policy":false,"required_status_checks":[{"context":"Workspace checks","integration_id":15368}]}}]}
```

The owner may create this ruleset with the repository rulesets API only after approval; record the response ID. If rollback is needed, delete that exact ID and verify rule `20121609` remains effective. [Full matrix PR #60](https://github.com/querry-kit/querry-kit/actions/runs/45086518530) and [docs-only PR #63](https://github.com/querry-kit/querry-kit/pull/63) are the two check-identity observations.

T008 verified: GitHub Actions app `15368` reported exactly one successful `Workspace checks` on the [docs-only head](https://github.com/querry-kit/querry-kit/actions/runs/45088015217/job/137411873364) and the [full head](https://github.com/querry-kit/querry-kit/actions/runs/45086518530/job/137407892360). The docs-only run passed scope/docs and skipped libraries, consumers and packed, as expected. Applying and testing a new rule remains T010.

## Activation

With explicit owner approval, `tobiaswaelde` applied [ruleset 27868282](https://github.com/querry-kit/querry-kit/rules/27868282) on 2026-11-23T01:56:14Z. Before: only deletion rule 20121609 applied; classic protection had no required contexts. After: the same deletion rule plus `Workspace checks` (integration 15368) on `refs/heads/main`. Rollback removes only ruleset 27868282. [Disposable non-draft PR #67](https://github.com/querry-kit/querry-kit/pull/67) tests the effective requirement.

# State and invariants

No persistent tables or API resources are introduced. These are the states an implementation or its tests must distinguish.

| Entity | Fields and relationships | Invariant or transitions |
| --- | --- | --- |
| Table identity | Configured key; fields requested; key value on stored row and incoming patch | The projection contains the key once. Null/undefined does not identify a row. Zero is not missing. A patch for an absent key cannot mutate any other row. |
| Autocomplete request lane | `selection` or `search`; request generation; pending flag; items; last relevant error | Start → settle only if current generation. Successful retry clears that lane's error; stale responses never restore an old error or clear the other lane. Empty selection resets selection state. |
| Distinct page | Scoped filter; ordered distinct key tuple; items; total groups; page size and metadata | Count the same distinct set as the row query, before page slicing. For an unsupported delegate, return the documented failure rather than an estimated count. |
| Persona operation | Current identity; read controller/generation; in-flight mutation count; switching flag | Writes settle on success or failure. A persona transition cannot interleave an old write and new identity as if both belonged to the same session. Late reads from the previous identity are ignored. |
| Column visibility control | Stable column ID; localized header/label; switch state | Name identifies both action and column; state remains a switch property, not a substitute for its name. |
| Release verification | Reviewed SHA, package, version, archive integrity, registry observation, provenance, time budget, Git tag | Missing before publish → submit once → awaiting visibility → verified → tag. Conflicts stop; timeout is pending/unconfirmed, not permission to submit again. Retry never changes the reviewed SHA or archive. |
| Package contract | Public package identity; supported entrypoints/conditions; supported peers and optional flags; required assets; consumer fixtures | Contract describes compatibility, not every incidental generated filename. Keep an independently reviewable diff when the contract changes. |
| CI decision and Pages artifact | Changed paths; required jobs; source event/ref/SHA; successful build/test run; immutable artifact ID/digest; deployment | Unknown/shared paths conservatively select full checks. Only artifacts from trusted, successful `main` push runs qualify for production; the tested and deployed bytes match. |
| Operational evidence | Alert/advisory, resolved dependency and lockfile; prior/effective rules; required check identity; approved operator; migration evidence links | A locally green fixture does not prove that GitHub enforced a rule, closed an alert or served the correct Pages revision. Verify those outcomes separately. |

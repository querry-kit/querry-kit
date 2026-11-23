# Confirming npm submissions

The protected job records `npm-submit/<package>@<version>` on the reviewed SHA before sending the tarball. Its success status means the submission was **claimed**, not that publication succeeded. The status binds the claim to the archive SHA-512; workflow concurrency serializes publishers. A claim with a different digest stops the job.

After submission (including an ambiguous client error), confirmation is read-only for up to ten minutes. A failed-job rerun reads the original artifact and claims: it can verify and tag claimed packages, and submit independently missing, never-claimed packages. Use **Re-run failed jobs** on the original run; do not start a new build or version. If a claim was recorded but the upload definitively never happened, leave the tag untouched and escalate to the npm owner; the automated path deliberately cannot clear a claim or replay that upload. A provenance/digest contradiction is not propagation delay.

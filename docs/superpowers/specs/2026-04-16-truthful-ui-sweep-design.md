# Truthful UI Sweep: Collaboration Attachment Cleanup

**Date:** 2026-04-16
**Status:** Design approved

## Context

Inkline currently exposes a misleading user-facing control in the collaboration composer: a disabled paperclip button labeled "Attach file (coming soon)" in [src/components/collaboration/MessageInput.tsx](/Users/henryduvet/Documents/Apps/inkline-app-master/src/components/collaboration/MessageInput.tsx). That control suggests a generic message-attachment feature exists or is imminent, but the only supported attachment flow today is draft-artwork upload through the existing upload modal.

This creates a trust problem. The app should advertise only the behavior it actually supports.

---

## Goal

Make the collaboration UI truthful by removing unsupported attachment affordances while preserving the real, working draft-artwork upload flow.

---

## Recommended Approach

Use a narrow "truthful UI sweep" rather than implementing new generic attachment behavior.

This approach:
- removes the misleading unsupported control
- keeps existing collaboration behavior intact
- avoids expanding scope into message schema changes, storage rules, rendering work, and additional validation paths

---

## Scope

### In Scope

1. **Collaboration composer cleanup**
   - Remove the disabled generic-attachment paperclip button from the message composer.
   - Keep the existing artwork-upload affordance as the only attachment action in the composer.
   - Ensure the upload affordance is labeled and described around its real purpose: sending draft artwork.

2. **Supported artwork flow preservation**
   - Keep the existing upload modal and panel-linking flow intact.
   - Do not change the current draft-artwork send behavior for online or offline modes.

3. **Small truthful-UI sweep**
   - Search for explicit user-facing teaser copy such as "coming soon" in product UI code.
   - Remove or revise any other misleading unsupported-product messaging discovered during this sweep.
   - Disabled controls that are valid state-based UX, such as "Send" being disabled until text exists, remain unchanged.

4. **Regression coverage**
   - Add a focused UI regression test for the collaboration composer so the unsupported teaser surface does not return silently.
   - Re-run `npm test`, `npm run lint`, and `npm run build`.

### Out of Scope

- Generic message attachments
- New message schema or storage behavior
- New backend upload categories
- Broader collaboration feature expansion
- Cosmetic redesign outside the truthful-UI cleanup

---

## UX Changes

### Collaboration Composer

Current behavior:
- composer shows a disabled paperclip button with "coming soon"
- composer also shows the supported image/draft-artwork action

New behavior:
- only supported actions remain visible
- the generic unsupported paperclip control is removed
- the artwork action remains available and should read clearly as a draft-artwork action rather than a generic attachment feature

This keeps the composer honest and makes the supported path more obvious.

### Sweep Rule

If a control or label suggests a product capability that does not actually exist, it should be removed or rewritten in this pass.

If a control is disabled only because the user has not met a valid interaction requirement, it should stay.

---

## Implementation Notes

Primary files expected to change:

- `src/components/collaboration/MessageInput.tsx`
- `src/components/collaboration/UploadModal.tsx`
- `src/views/Collaboration.tsx`

Potential supporting test files:

- a new collaboration composer test file under `src/components/collaboration/`
- test runner or test config only if required by the current setup

The implementation should follow existing component structure and avoid introducing new shared abstractions unless clearly necessary.

---

## Verification

Required checks:

1. `npm test`
2. `npm run lint`
3. `npm run build`
4. a string/code sweep confirming no explicit unsupported "coming soon" teaser remains in product UI surfaces touched by this pass

Manual behavior to confirm:

- collaboration composer still sends text messages
- draft artwork upload still opens and works through the existing flow
- no generic attachment option is shown unless that feature actually exists

---

## Risks and Mitigations

### Risk: removing the paperclip makes attachment capability feel reduced

Mitigation:
- keep the real artwork-upload action visible and clearly named
- prefer accuracy over implied future capability

### Risk: sweep grows into a broad UI audit

Mitigation:
- constrain this pass to explicit misleading unsupported-product surfaces
- defer unrelated polish to later work

---

## Success Criteria

- The collaboration composer no longer advertises unsupported generic attachments.
- The supported draft-artwork flow remains intact.
- The cleanup is locked in with regression coverage.
- The repo remains green on tests, lint, and build.

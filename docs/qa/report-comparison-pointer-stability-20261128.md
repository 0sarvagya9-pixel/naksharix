# Report comparison: native pointer stability

## Observed failure

The first complete browser run for `dd4ccde22b34be4ca9508ddeddcc50b1b95ee9d6`
finished with 316 passes, 10 configured skips and one Firefox failure:
`A17 and A18 report comparison uses the renderer-backed benefits and exact catalogue prices`.
The native disclosure stayed closed after its summary was clicked, so the role-based
locator correctly did not expose the hidden `3/3` status.

Run: https://github.com/0sarvagya9-pixel/naksharix/actions/runs/46099471773

Job: `browser-audit`, `140838390998`. Failure artifact `15245028850` SHA-256:
`3f640586a5367bfb21ee447e11509b494138af6e2184584af964c57c4713d94d`.

The independently inspected trace shows `data-hydrated=true` before the actual
pointer input. The comparison DOM is unchanged from input through the failed
assertion. During the 33 ms click, document scrollTop moves from 0 to 24 and then
continues to 138. There is no observed open transition, React replacement or
console error. These observations support a native activation lost while the
target moves during global smooth scrolling. The trace does not record the native
pointerup target, so it is not a direct measurement of a release-target mismatch.

## Repair and unchanged acceptance

The existing accessibility stylesheet now uses immediate document scrolling on
pages containing `#compare-reports`, as it already does for credential/report
intake controls. Native details/summary semantics and application selection state
are unchanged. Other pages retain their existing scrolling behavior.

The original cross-browser acceptance test still performs a real summary click
and all original price, renderer-benefit, three-item cap, empty-selection and
navigation assertions. It additionally checks the surface's computed scroll
behavior and the native open attribute. No force click, scripted open, retry,
timeout increase or skip was added. Waiting only for hydration would not address
the already-hydrated failure observed in the trace.

The original failed run and its receipts remain evidence. Qualification of the
repair requires the affected native interaction and the complete required CI
gate to pass on the repaired source. Final receipts are recorded separately from
this source-time failure diagnosis.

# CLAUDE.md — Project Operating Manual

This file is the contract between this codebase and any AI coding agent, human engineer,
or future vibe-coding session. Read it fully before making any change.

---

## 1. Identity & authorship

Every commit in this repository has exactly one author, regardless of who or what wrote
the code:

```
Name:  The Builder
Email: the.builder.mode.on@gmail.com
```

Configure this before your first commit:

```bash
git config user.name "The Builder"
git config user.email "the.builder.mode.on@gmail.com"
```

Never push a commit under a different name, email, or auto-generated identity (e.g.
"claude[bot]", a personal GitHub account, or a CI service account). If a tool commits
automatically, override its author field explicitly.

---

## 2. Scale-first coding principles

Write every feature as if it will serve 1 million users next month.

- **Stateless by default.** No user state in memory. Every service instance must be
  interchangeable. Use the database or a cache for anything that must persist.
- **Idempotent operations.** Every write endpoint must be safe to call twice with the
  same payload. Use idempotency keys where needed.
- **Decouple early.** Keep UI, business logic, and data access in separate layers from
  day one. Never embed SQL or API calls directly in a UI component.
- **Feature flags over big-bang releases.** Wrap new behaviour in a flag so it can be
  turned off instantly without a rollback.
- **No magic numbers.** Every threshold, limit, or constant lives in a named config
  value with a comment explaining its origin.
- **Fail loudly in development, gracefully in production.** Throw errors during local
  development; return structured error objects with user-friendly messages in production.
- **Instrument everything.** Every background job, API call, and data pipeline must emit
  a structured log line that includes: timestamp, operation name, duration, success/fail,
  and the record count or affected entity ID.

---

## 3. Inclusive UI — accessible to all, English optional

The platform must be usable by someone who:
- Has low English literacy or speaks a different primary language
- Is not technically sophisticated
- Uses a screen reader or keyboard-only navigation
- Is on a slow mobile connection

### 3.1 Internationalisation (i18n)

- Every string shown to a user must come from a translation file. No hardcoded UI text
  in component code.
- Use a single translation key namespace per feature (e.g. `dashboard.summary.title`).
- Date, time, number, and currency formats must use the user's locale, not a hardcoded
  format.
- Text must never be concatenated from fragments; use full-sentence translation keys so
  translators can handle word-order differences across languages.
- Right-to-left (RTL) layout support must not be an afterthought. Use logical CSS
  properties (`margin-inline-start`, `padding-inline-end`) from the start.

### 3.2 Clarity and plain language

- Every label, button, and error message must be understandable at a 6th-grade reading
  level in its original language.
- Use icons alongside text, never instead of text.
- Error messages must say what happened and what the user should do next. Never show a
  raw error code or stack trace to an end user.
- Loading states must show progress, not just a spinner.
- Destructive actions (delete, submit final, send) require a confirmation step with a
  plain-language summary of what will happen.

### 3.3 Accessibility

- All interactive elements are keyboard-navigable and have visible focus indicators.
- All images have meaningful `alt` text. Decorative images use `alt=""`.
- Colour is never the only way to convey information (always pair with a label or icon).
- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large text and UI components.
- Screen-reader roles and ARIA labels must be correct. Run an automated accessibility
  audit (e.g. axe, Lighthouse) on every new screen before marking it done.

---

## 4. Changelog and documentation — mandatory on every change

Every code change, no matter how small, must be followed by an update to `CHANGELOG.md`
in the same commit. No exceptions.

### 4.1 CHANGELOG.md format

```
## [YYYY-MM-DD] — <one-line summary>

### What changed
- <bullet describing the functional change>
- <bullet for each additional change in this commit>

### Why
<One paragraph explaining the business or technical reason.>

### Data & calculation notes
<If any number, metric, or formula changed: describe the old and new
calculation, where the data comes from, and what the expected delta is.
If nothing numeric changed, write "None.">

### Upgrade notes for the next engineer or AI session
<Step-by-step instructions for anyone picking this up next:
  - Environment variables added or changed
  - Database migrations required
  - Third-party services newly depended on
  - Known limitations or follow-up work needed
If there is nothing special to note, write "None.">

### Credits & third-party use
<List every external API, dataset, library, or content source newly used
in this change. See section 7 for required fields.
If nothing new was added, write "None.">
```

### 4.2 README.md

`README.md` must always reflect the current state of the project. Update it in the same
commit when any of the following change: setup steps, environment variables, third-party
dependencies, or the overall architecture.

---

## 5. Data sanctity and number traceability

Every number shown in the UI or used in a business decision must have a documented,
traceable origin.

### 5.1 The golden rule

> If a number appears on screen, there must be a function in the backend — with a name,
> a docstring, and unit tests — that produces it. That function must reference its
> inputs by name and explain the formula in a comment.

Example:

```python
def monthly_active_users(start_date: date, end_date: date) -> int:
    """
    Returns the count of distinct user IDs that performed at least one
    qualifying event in the given date range.

    Qualifying events: login, page_view, api_call.
    Source table: events
    Deduplication: COUNT(DISTINCT user_id)
    """
    ...
```

### 5.2 Rules

- No number may be hardcoded in a UI component. It must be fetched from a backend
  endpoint that derives it from a named function.
- Aggregations (sums, averages, percentages) must include the denominator in the
  response payload so the UI can show context (e.g. "12 of 45 users").
- Whenever a metric definition changes (even a filter change), the CHANGELOG must
  document the old formula, the new formula, and the expected impact on historical values.
- All financial figures must use arbitrary-precision arithmetic. Never use
  floating-point for money.
- Timestamps must be stored and transmitted in UTC. Conversion to local time happens
  only at the display layer.

---

## 6. API efficiency — pull once, cache, serve many

Frequent external API calls are wasteful and fragile. The default architecture is:

```
External API → Backend fetcher (scheduled) → Internal cache/DB → All app queries
```

### 6.1 Scheduling

- External data sources are pulled **at most once or twice per 24-hour period** unless
  the source explicitly requires real-time access and cost is justified.
- Scheduled jobs run at off-peak times (e.g. 02:00 and 14:00 UTC) to spread load.
- Every scheduled job logs: start time, source, records fetched, records changed, end
  time, and any errors.

### 6.2 Caching

- Fetched data is stored in the application database or a dedicated cache layer
  (e.g. Redis). The cache record must include: `fetched_at` (UTC), `source_url`,
  `data_hash`, and `ttl_seconds`.
- App code queries the internal cache, never the external API directly (except in the
  scheduled fetcher).
- If the cache is stale or missing, the app shows the last known data with a
  `data_as_of` timestamp, and queues a refresh — it does not block the user.

### 6.3 Cost awareness

- Before adding any new external API dependency, document its pricing model in the
  CHANGELOG and in a `docs/api-costs.md` file.
- If an API charges per request, add a counter and alert threshold so runaway calls are
  caught before they cause a large bill.

---

## 7. Third-party credits, attribution, and terms of use

Using someone else's data, content, design, or code is fine — but it must be done
transparently.

### 7.1 Before using any third-party source

1. **Check the Terms of Use.** Look specifically for: commercial use restrictions, data
   redistribution rights, attribution requirements, and rate limits.
2. **Record the finding** in the relevant CHANGELOG entry and in
   `docs/third-party-sources.md` (see format below).
3. **Inform the user.** If a feature depends on data from an external provider, the UI
   must surface this (e.g. "Data provided by X under Y licence").

### 7.2 docs/third-party-sources.md format

```
## <Source name>

- URL: <source homepage or API docs>
- Licence / Terms: <licence name or link to ToS>
- Commercial use allowed: Yes / No / Restricted (describe)
- Redistribution allowed: Yes / No / Restricted (describe)
- Attribution required: Yes (exact wording required: "<wording>") / No
- Review date: YYYY-MM-DD
- Reviewed by: <initials or "AI-assisted, human verified">
- Notes: <anything unusual or that needs legal follow-up>
```

### 7.3 Attribution in the UI

Every screen or export that contains third-party data must carry the required attribution
in a visible but unobtrusive location (e.g. a footer line or an info tooltip). The
wording must match what the Terms of Use require exactly.

### 7.4 When in doubt, pause and ask

If the Terms of Use are ambiguous or if commercial redistribution is unclear, do not
proceed. Surface the uncertainty to the user or project owner with the relevant excerpt
from the ToS so they can make an informed decision.

---

## 8. Security and environment hygiene

- **No secrets in code.** API keys, tokens, passwords, and connection strings must live
  in environment variables or a secrets manager. Never commit them, even in a comment
  or a sample file.
- **`.env.example`** must exist and be kept up to date, listing every required variable
  with a description and a safe placeholder value.
- **Input validation** happens on the server, always. Client-side validation is
  supplemental UX only, never the security boundary.
- **Dependencies** must be pinned to exact versions. Run a dependency audit before any
  release. Flag any package with a known CVE and do not ship it without a documented
  risk decision.
- **Rate-limit all external-facing endpoints** from day one.

---

## 9. AI session checklist — before ending any coding session

Before closing out a vibe-coding session, verify:

- [ ] All new UI strings are in the translation file, not hardcoded
- [ ] All numbers shown in the UI trace back to a named backend function
- [ ] No new external API is called more frequently than the schedule in section 6
- [ ] `CHANGELOG.md` is updated with this session's changes
- [ ] `README.md` reflects any setup or architecture changes
- [ ] `docs/third-party-sources.md` lists any new data sources, with ToS status
- [ ] The commit author is `The Builder <the.builder.mode.on@gmail.com>`
- [ ] No secrets, keys, or credentials appear anywhere in the diff
- [ ] Accessibility: new UI passes keyboard navigation and has correct ARIA roles
- [ ] Error states are handled and show a plain-language message to the user

---

## 10. Guiding philosophy

> Build as if the person using this has never seen software before, speaks a language
> you don't know, and is trusting you with something that matters to them.
> Build as if another engineer — human or AI — will pick this up tomorrow and needs to
> understand every decision you made today.

When these two goals are in tension, resolve it by doing more documentation, not less
code.

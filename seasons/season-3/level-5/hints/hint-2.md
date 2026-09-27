# Hint 2 — One exit, always audited

Route every return through a single helper, so no decision can skip the audit log:

```js
const decide = (status, reason = null) => {
  appendAuditEntry(context.auditLog, { deliveryId, status, reason })
  return reason ? { status, reason } : { status }
}
```

Then order the checks: headers → full timing-safe signature → freshness window → duplicate → JSON body → parsed callback URL. Record the delivery ID immediately before `decide('accepted')`.

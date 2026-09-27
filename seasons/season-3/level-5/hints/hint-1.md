# Hint 1 — Map the pipeline before you change it

Write the seven rules down as a checklist, then trace the starter's order of operations against it:

- When does the starter write to `seenDeliveryIds`, before or after it knows who sent the request?
- What does `startsWith` accept when the attacker sends fewer characters, or none at all?
- Where does a stale timestamp get rejected?
- How many places return a decision, and how many of them reach the audit log?

Each Season 3 mission solved one of these. The boss is about getting the order right.

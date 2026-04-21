# Level 1: Merchant Mirage

## The Scenario

Welcome to **Season 2: Card Code & Rules Engine**.

Investec's Programmable Banking lets you write JavaScript that runs on the card before every transaction is authorised. The platform calls your `beforeTransaction(event)` function and uses the returned `{ approved: true/false }` to accept or decline in real time.

FinFlow's compliance team has a strict rule:

> **Gambling transactions must always be declined.**

The engineering team implemented an MCC (Merchant Category Code) filter. MCC `5816` (Digital Goods: Games) and `7995` (Betting/Casino Gambling) are on the blocklist.

However, a QA tester just noticed something alarming: some gambling transactions are **slipping through**. They're being approved even when the card code should have declined them.

Your job: **find the bug and fix it**.

## Background: MCC Codes

A Merchant Category Code (MCC) is a 4-digit number that categorises what type of business a merchant is. Card networks include it in every transaction event.

In the Investec card event payload, the MCC arrives as:

```json
{
  "merchant": {
    "category": {
      "code": "7995",
      "name": "Betting/Casino Gambling"
    }
  }
}
```

Note: `code` is a **string**.

## Your Task

Edit `solution.js`. The `beforeTransaction(event)` function has a bug.

Find it. Fix it. Run `investec-game test` to verify.

**Do not change the blocked MCC list — only fix the comparison logic.**

## Win Condition

- All behavior tests pass: allowed merchants go through, blocked MCCs are declined
- The attack script — which exploits the type-coercion bug — is now blocked

Run `investec-game test --season 2 --level 1` to check.

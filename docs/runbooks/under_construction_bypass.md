# Under-construction bypass

When the site is in under-construction mode, the owner can unlock it for one browser with a signed,
HTTP-only cookie (30 days). The secret is `UNDER_CONSTRUCTION_BYPASS_SECRET`.

**The secret is never accepted in the URL** (URLs end up in access logs, history and referrers).
Send it in a header or a POST JSON body.

## Unlock

Command line:

```bash
curl -i -X POST https://YOUR-SITE/api/bypass \
  -H "content-type: application/json" \
  -d '{"secret":"YOUR_SECRET"}'
```

Browser console, on the site itself (the response sets the cookie; then reload):

```js
await fetch("/api/bypass", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ secret: "YOUR_SECRET" }),
  redirect: "manual",
});
location.href = "/";
```

## Lock again

Open `/api/bypass?clear=1` (the `clear` flag is not sensitive and may use the URL).

## Notes

- A wrong or missing secret returns `401`; comparison is constant-time and the cookie holds a signed
  token, never the secret itself.
- Rotate `UNDER_CONSTRUCTION_BYPASS_SECRET` if it was ever sent in a URL before this change.

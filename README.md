# Free SMS Sender — Vercel API + GoatBot Command

Number দেখাবে sender হিসেবে (তোমার phone এর SIM নাম্বার), custom name না — যেমনটা confirm করেছ।

## Part 1: Phone কে SMS Gateway বানাও (ফ্রি)

1. Play Store থেকে **"SMS Gateway for Android" (SMSGate)** app install করো
   (developer: capcom6 / package: `com.sms.gateway` — search "SMS Gateway for Android")
2. App open করো → **Cloud Server** mode select করো (Local না — কারণ Vercel থেকে phone কে সরাসরি hit করা যাবে না)
3. App নিজে থেকে একটা **username + password** generate করে দিবে (Cloud account, কোনো email/registration লাগে না)
4. এই username/password টা copy করে রাখো — এটা `SMS_USERNAME` আর `SMS_PASSWORD` হিসেবে লাগবে
5. Phone টা internet এ connected রাখতে হবে (WiFi/Mobile data) — app background এ চলতে থাকবে

## Part 2: GitHub এ কোড push করো

1. GitHub এ নতুন repo বানাও (public/private যেকোনোটা)
2. এই ফোল্ডারের সব ফাইল (`api/send-sms.js`, `package.json`, `vercel.json`) push করো:
```bash
git init
git add .
git commit -m "sms sender api"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

## Part 3: Vercel এ Deploy করো

1. https://vercel.com এ যাও → GitHub দিয়ে login করো
2. "Add New Project" → তোমার repo select করো → Deploy
3. Deploy হওয়ার পর Project → **Settings → Environment Variables** এ গিয়ে এগুলো add করো:
   - `SMS_USERNAME` = (Part 1 এ পাওয়া username)
   - `SMS_PASSWORD` = (Part 1 এ পাওয়া password)
   - `API_SECRET` = (নিজে একটা shokto random string বানাও, e.g. `rocky-sms-secret-2026-xyz`)
4. Environment variable add করার পর একবার **Redeploy** করো (Deployments tab → ⋯ → Redeploy)
5. তোমার API URL হবে: `https://<your-project-name>.vercel.app/api/send-sms`

## Part 4: Test করো (Postman/curl দিয়ে)

```bash
curl -X POST https://<your-project-name>.vercel.app/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{"number":"017XXXXXXXX","text":"Test message","secret":"rocky-sms-secret-2026-xyz"}'
```

SMS যদি phone থেকে গিয়ে থাকে, response এ `"success": true` আসবে।

## Part 5: GoatBot এ বসাও

1. `sendsms.js` ফাইলটা copy করে `modules/commands/` folder এ রাখো
2. ফাইলের উপরে দুইটা variable বদলাও:
```js
const API_URL = "https://<your-project-name>.vercel.app/api/send-sms";
const API_SECRET = "rocky-sms-secret-2026-xyz"; // Part 3 এ যেটা env এ দিয়েছ, ঠিক সেইটাই
```
3. Bot restart করো
4. Messenger এ `/sendsms` টাইপ করলে bot number চাইবে → number দিলে text চাইবে → text দিলে সেই number এ real SMS চলে যাবে

## Limitations (free method এর)

- Sender হিসেবে phone এর real SIM number দেখাবে, custom name না
- Phone টা সবসময় internet এ on রাখতে হবে, নাহলে SMS queue এ আটকে থাকবে
- Carrier এর নিজস্ব daily SMS limit থাকতে পারে (spam prevention এর জন্য)
- অনেক বেশি bulk sending করলে carrier account flag করতে পারে — personal/moderate use এর জন্য ভালো

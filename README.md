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

## Part 6: সরাসরি API-তে ঢুকে SMS পাঠানো

এখন দুইভাবে সরাসরি API ব্যবহার করে SMS পাঠাতে পারবেন (GoatBot ছাড়াই):

### A) ওয়েব পেজ দিয়ে (সবচেয়ে সহজ)

Vercel deploy করার সাথে সাথে একটা ফর্ম পেজও deploy হয়ে যাবে (`public/index.html`)। ব্রাউজারে গিয়ে খুলুন:

```
https://<your-project-name>.vercel.app/
```

ফর্মে ৩টা ঘর দেখবেন:
- **API Secret** → যেটা Vercel env var-এ `API_SECRET` হিসেবে দিয়েছেন
- **নম্বর** → যেই নম্বরে SMS যাবে (নিজের নম্বর অথবা যিনি অনুমতি দিয়েছেন)
- **মেসেজ** → যা পাঠাতে চান

"পাঠান" বাটনে ক্লিক করলে সাথে সাথে SMS চলে যাবে এবং নিচে success/error দেখাবে।

⚠️ এই পেজে কেউ URL জানলেই ঢুকতে পারবে, কিন্তু Secret ছাড়া কেউ SMS পাঠাতে পারবে না। চাইলে পুরো Vercel project-টা private/password-protected রাখতে পারেন (Vercel → Settings → Deployment Protection)।

### B) curl / Postman দিয়ে

**curl (টার্মিনাল):**
```bash
curl -X POST https://<your-project-name>.vercel.app/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{"number":"017XXXXXXXX","text":"আপনার মেসেজ","secret":"আপনার-secret"}'
```

**Postman:**
1. নতুন request → Method: `POST`
2. URL: `https://<your-project-name>.vercel.app/api/send-sms`
3. Headers ট্যাবে যোগ করুন: `Content-Type: application/json`
4. Body ট্যাব → `raw` → `JSON` সিলেক্ট করে লিখুন:
```json
{
  "number": "017XXXXXXXX",
  "text": "আপনার মেসেজ",
  "secret": "আপনার-secret"
}
```
5. Send চাপুন → response এ `"success": true` আসলে SMS চলে গেছে

## Limitations (free method এর)

- Sender হিসেবে phone এর real SIM number দেখাবে, custom name না
- Phone টা সবসময় internet এ on রাখতে হবে, নাহলে SMS queue এ আটকে থাকবে
- Carrier এর নিজস্ব daily SMS limit থাকতে পারে (spam prevention এর জন্য)
- অনেক বেশি bulk sending করলে carrier account flag করতে পারে — personal/moderate use এর জন্য ভালো

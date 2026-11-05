# 3Talaba Campus — Himoya Tizimi (Faqat 443/TCP) va Yuqori Trafik (Zero-Freeze) Qo'llanmasi

Ushbu tizim serverda **barcha tashqi portlarni (`80`, `3000`, `5432` va h.k.) to'liq yopib**, tashqi internet uchun **faqatgina `443/tcp` (TLS 1.3 / HTTP2)** shifrlangan portini ochiq qoldiradi hamda bir vaqtda minglab foydalanuvchi kirganda ham sayt qotmasdan ishlashini ta'minlaydi.

---

## Arxitektura Qatlamlari

1. **Tarmoq va Kernel Qatlami (`deploy/security/lockdown-443-only.sh`):**
   - `UFW` / `iptables` orqali barcha kiruvchi ulanishlar rad etiladi (`default deny incoming`), faqat `443/tcp` ga ruxsat beriladi.
   - Linux Kernel `TCP BBR` va `somaxconn = 65535` orqali SYN-Flood DDoS hujumlaridan himoyalanadi.
2. **Nginx TLS 1.3 + Microcaching Qatlami (`deploy/nginx/`):**
   - Faqat `443 ssl` + `http2` tinglanadi (ochiq `80`-port mavjud emas).
   - IP-manzil orqali to'g'ridan-to'g'ri skanerlash so'rovlari `ssl_reject_handshake on;` bilan SSL bosqichidayoq uziladi.
   - **Stampede-Proof Microcaching (`proxy_cache_lock on`)**: bir vaqtda 10,000+ o'quvchi kirsa ham Next.js ga faqat 1 ta so'rov o'tadi, qolganlari Nginx xotirasidan `<1ms` da javob oladi.
   - `/_next/static/*` fayllar 365 kunga keshlanib, Node.js protsessoriga umuman yuk tushirmaydi.
3. **Ilova Qatlami (`src/middleware.ts` + `src/lib/rate-limit.ts` + `netlify.toml`):**
   - Zararli skaner yo'llari (`/.env`, `/.git`, `/wp-admin`) `0ms` da `403` bilan bloklanadi.
   - Xotira to'lib qolmaydigan (Bounded LRU) Token-Bucket Rate-Limiter har bir IP uchun API va AI so'rovlarini me'yorlaydi.
   - HSTS (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`) brauzerni har doim faqat `443/tcp` HTTPS ishlatishga majbur qiladi.

---

## Ishga Tushirish (Linux VPS / Dedicated Server)

### 1. TLS Sertifikatlarini Joylash (`fullchain.pem` va `privkey.pem`)
Let's Encrypt (`DNS-01` challenge — 80-portni ochmasdan sertifikat olish imkonini beradi) yoki Cloudflare Origin CA sertifikatingizni `./deploy/ssl/` papkasiga joylang:
```bash
mkdir -p deploy/ssl
cp /path/to/fullchain.pem deploy/ssl/fullchain.pem
cp /path/to/privkey.pem deploy/ssl/privkey.pem
chmod 600 deploy/ssl/privkey.pem
```

### 2. Barcha Portlarni Yopib, Faqat `443/tcp` ni Ochiq Qoldirish
- Cloud Console (masalan DigitalOcean/Hetzner/AWS SSM web-konsoli) orqali ishga tushirish (100% faqat `443/tcp` ochiq qoladi):
```bash
sudo bash deploy/security/lockdown-443-only.sh
```
- Agar o'zingizning yagona statik IP manzilingizdan SSH ni saqlab qolmoqchi bo'lsangiz:
```bash
sudo bash deploy/security/lockdown-443-only.sh --allow-ssh-from SIZNING_STATIK_IP_MANZILINGIZ
```

### 3. Docker Orqali Yopiq Tarmoqda Ishga Tushirish
`docker-compose.prod.yml` ichida Next.js (`3000`) va PostgreSQL (`5432`) tashqi tarmoqdan uzilgan (`internal: true`), tashqariga faqat Nginx `443:443/tcp` porti chiqarilgan:
```bash
POSTGRES_PASSWORD="Kuchli_Maxfiy_Parol_2026!" docker compose -f docker-compose.prod.yml up -d --build
```

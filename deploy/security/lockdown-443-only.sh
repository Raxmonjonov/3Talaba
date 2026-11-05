#!/usr/bin/env bash
# ==============================================================================
# 3Talaba Campus — Faqat 443/TCP Ochiq Qoldirish va High-Traffic Kernel Sozlamasi
# Foydalanish:
#   sudo bash deploy/security/lockdown-443-only.sh
#   (Agar aniq bitta IP-manzildan SSH boshqaruvni saqlab qolmoqchi bo'lsangiz:
#    sudo bash deploy/security/lockdown-443-only.sh --allow-ssh-from 203.0.113.10)
# ==============================================================================

set -euo pipefail

ADMIN_SSH_IP=""
if [[ "${1:-}" == "--allow-ssh-from" && -n "${2:-}" ]]; then
  ADMIN_SSH_IP="$2"
fi

if [[ "${EUID}" -ne 0 ]]; then
  echo "[XATO] Ushbu skriptni root (sudo) huquqi bilan ishga tushiring." >&2
  exit 1
fi

echo "==> [1/3] Yuqori trafik (High-Traffic) va SYN-Flood himoyasi uchun Linux Kernel (TCP BBR) sozlanmoqda..."
cat >/etc/sysctl.d/99-3talaba-high-traffic.conf <<'EOF'
# Maksimal tarmoq navbatlari (10,000+ ulanishda ham navbat to'lib qolmasligi uchun)
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 65535
net.ipv4.tcp_max_syn_backlog = 65535

# SYN-Flood va DDoS hujumlariga qarshi himoya
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 2

# Bo'shagan ulanishlarni tezkor qayta ishlatish
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_keepalive_time = 300
net.ipv4.ip_local_port_range = 1024 65535

# Google TCP BBR algoritmi — sekin mobil internetda ham sayt qotmasdan ochilishini ta'minlaydi
net.core.default_qdisc = fq
net.ipv4.tcp_congestion_control = bbr

# IP spoofing va ICMP redirect hujumlarini bloklash
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
EOF

sysctl --system >/dev/null || true

echo "==> [2/3] Firewall sozlanmoqda: BARCHA kiruvchi portlar yopiladi, FAQAT 443/tcp ochiq qoldiriladi..."
if command -v ufw >/dev/null 2>&1; then
  ufw --force reset
  ufw default deny incoming
  ufw default allow outgoing

  # Faqat shifrlangan HTTPS 443/tcp portiga ruxsat! (80, 3000, 5432 va boshqa barcha portlar YOPIQ)
  ufw allow 443/tcp comment '3Talaba HTTPS TLS 1.3 Only'

  # Ixtiyoriy: Faqat administratorning yagona statik IP manzili uchun SSH (agar berilgan bo'lsa)
  if [[ -n "${ADMIN_SSH_IP}" ]]; then
    ufw allow from "${ADMIN_SSH_IP}" to any port 22 proto tcp comment 'Restricted Admin SSH'
  fi

  ufw --force enable
  ufw status verbose
else
  # UFW yo'q tizimlar uchun to'g'ridan-to'g'ri iptables qoidalari
  iptables -F
  iptables -X
  iptables -P INPUT DROP
  iptables -P FORWARD DROP
  iptables -P OUTPUT ACCEPT

  # Loopback (127.0.0.1:3000 Nginx <-> Next.js ichki aloqasi) va mavjud javob paketlari
  iptables -A INPUT -i lo -j ACCEPT
  iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

  # Faqat 443/tcp portiga ruxsat
  iptables -A INPUT -p tcp --dport 443 -m conntrack --ctstate NEW -j ACCEPT

  if [[ -n "${ADMIN_SSH_IP}" ]]; then
    iptables -A INPUT -p tcp -s "${ADMIN_SSH_IP}" --dport 22 -m conntrack --ctstate NEW -j ACCEPT
  fi

  echo "[OK] iptables orqali faqat 443/tcp ochildi, qolgan barcha portlar yopildi."
fi

echo "==> [3/3] Nginx kesh katalogi tayyorlanmoqda..."
mkdir -p /var/cache/nginx/3talaba /etc/nginx/ssl
chmod 700 /etc/nginx/ssl

echo "✅ Himoya tizimi faollashtirildi: Tashqi dunyo uchun FAQAT 443/tcp (TLS) porti ochiq!"

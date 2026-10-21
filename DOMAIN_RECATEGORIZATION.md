# Domain recategorization requests: lctuniversal.com

Some business networks block `lctuniversal.com` because of how their security vendor rates the domain, not because of anything wrong with the site. This file has what's needed to ask each vendor to review the domain: the evidence, ready-to-paste text, and where to submit.

## Evidence (October 16, 2026)

Independent checks from 60 networks (Globalping) found the site reachable from 58 of them. The two failures were both filters on the visitor's own network:

- **Fortinet FortiGate firewall, US business office (Brunswick, GA; LiveOak Fiber).** The firewall (certificate issuer `O=Fortinet, CN=FG101FTK21025132`) answered `https://lctuniversal.com/` and `https://www.lctuniversal.com/` with its own 403 block page within 3–4 ms. Through the same firewall, the identical site at `https://lctuniversaltransport.netlify.app/` loaded (HTTP 200), as did `netlify.com`, `kubernetes.io` and `example.com`. So the block applies to the domain name only.
- **DNS filter (Manhattan, NY network).** The local resolver answered `0.0.0.0` (blocked) for `lctuniversal.com` while resolving everything else normally.

The domain was **not found** on Google Safe Browsing or on the HaGeZi (threat intelligence, pro, ultimate), OISD, StevenBlack, Phishing Army, URLhaus, AdGuard, Phishing.Database or Dandelion Sprout lists. It was registered on February 24, 2026.

Globalping measurement IDs (open `https://globalping.io/?measurement=<id>` while they're retained):
- `2zEX0CGq7te0SRSr500021KOA`: lctuniversal.com from 20 US ISP networks, including the FortiGate 403
- `2SI6ltLFlCjY18BLv00021KOA`: www.lctuniversal.com from the same probes
- `2LsJXa51PtOF4UPDW00021KOA`: lctuniversal.com from 20 US datacenter networks, 20/20 OK

## Evidence (October 21, 2026): ISP router security

A business office reported Chrome showing `ERR_SSL_PROTOCOL_ERROR` ("lctuniversal.com sent an invalid response") on its Wi-Fi. The site itself checked clean: DNS points only to Netlify (apex `75.2.60.5`, `www` CNAME to `lctuniversaltransport.netlify.app`, no stray AAAA), the Let's Encrypt certificate covers both names, and TLS 1.2/1.3 work. 30/30 US home ISP probes and 15/15 Texas probes loaded `https://lctuniversal.com/`.

One Comcast home network (Seattle, AS7922) reproduced the error exactly:

- `https://lctuniversal.com/` and `https://www.lctuniversal.com/`: the router answered port 443 in plain text (`wrong version number`), which Chrome reports as `ERR_SSL_PROTOCOL_ERROR`.
- `http://lctuniversal.com/`: `302` to `https://www.safebrowse.io/warn.html?url=...`, the block page of the router's built-in security filter (Xfinity Advanced Security; Cox uses the same service as `coxsafebrowse.io`).
- `https://lctuniversaltransport.netlify.app/` through the same router: `200`. The block applies to the domain name only.

Globalping IDs: `2NibmtYBEOnyRRe5p00021M8c` (www, 29/30 OK), `2IAf4qSmEkJLu68nv00021M8e` (apex HTTPS, same probes), `2D5LLJzrs06JH24jt00021M8e` (apex HTTP, shows the safebrowse.io redirect), `2Hy0bDNiUEwYmh6og00021M8d` (netlify.app, 200).

### What the site now does to look like what it is (October 21, 2026)

- `index.html` ships the title, description, Open Graph tags, LocalBusiness JSON-LD and a plain-HTML business summary (see `src/lib/site-head.ts`). Before, every URL returned an empty `<div id="root">` with only script tags.
- MyLimoBiz's `widget-loader.js` loads only on `/book` or when a visitor reaches for Client Login. Before, every page view loaded three hidden login iframes and a hidden booking iframe (MyLimoBiz, Stripe, Google Maps, Facebook, LogRocket, Square: ~3.4 MB, 118 requests), and a first-time Safari visitor was redirected to `book.mylimobiz.com` and back on whatever page they opened first.

### `www` on Telecom Egypt (and DNS change needed)

`www.lctuniversal.com` is a CNAME to `lctuniversaltransport.netlify.app`, which Netlify geo-routes. From Telecom Egypt (AS8452, Egypt's largest ISP) it resolves to Netlify's Frankfurt edges (`35.157.26.135`, `63.176.8.218`), which don't accept TCP connections from that network, so `www` never loads there. Reproduced from this machine and from the Globalping TE-AS probe (`2PCv0xrLaX4YLmBNr00021M8y`). The apex uses Netlify's anycast address `75.2.60.5`, which loaded from all 21 countries tested (`2fLJuFJFOSVzv0BHh00021M8x`), including that same TE-AS network.

Fix (Namecheap, Domain List → lctuniversal.com → Advanced DNS): replace the `www` CNAME record with an **A record**, host `www`, value `75.2.60.5`, TTL Automatic. `www` only redirects to the apex, so it loses nothing by using the same address.

### Finding out which filter an office uses

Run this on a computer connected to the office Wi-Fi (Terminal on a Mac):

```
curl -sI http://lctuniversal.com | grep -i location
nslookup lctuniversal.com
```

- `location` contains `safebrowse.io`: Xfinity / Comcast Business (or Cox) router security.
- `location` is `https://lctuniversal.com/` but `nslookup` returns anything other than `75.2.60.5`: a DNS filter. The returned address identifies the vendor.
- Neither: an office firewall (FortiGate, SonicWall, Sophos, etc.). Its admin's block log names the category.

Chrome won't show the block page itself, because the site sends HSTS and the browser upgrades to HTTPS before the filter can answer.

## Business details for the forms

| Field | Value |
|---|---|
| URL | `lctuniversal.com` (also `www.lctuniversal.com`) |
| Business | LCT Universal Executive Transports |
| What it is | Chauffeured executive transportation: airport transfers, corporate travel, events, Dallas–Fort Worth / Grapevine, Texas |
| Contact | reservations@lctuniversal.com · +1 (888) 615-4065 |
| Requested category | **Travel** (fallback: **Business**) |

## Ready-to-paste justification

Replace `[CURRENT CATEGORY]` with what the vendor's lookup shows.

> lctuniversal.com is the official website of LCT Universal Executive Transports, a chauffeured transportation company serving Dallas–Fort Worth and Grapevine, Texas (airport transfers, corporate and event transportation). The site offers company information, contact forms and an online booking window operated by the MyLimoBiz reservation platform. It hosts no downloads, advertising networks or user-generated content. The domain is currently rated [CURRENT CATEGORY], which causes business firewalls to block our clients. Please review it and categorize it as Travel (or Business). Contact: reservations@lctuniversal.com.

## Where to submit (most important first)

| Vendor | Used by | Lookup / request | Suggested category |
|---|---|---|---|
| **Xfinity Advanced Security** (confirmed blocking) | Comcast / Xfinity home and business gateways | https://spa.xfinity.com/report: choose "I can't reach a website that I want to go to" | Not categorized: ask for the block to be removed |
| **Fortinet FortiGuard** (confirmed blocking) | FortiGate firewalls, FortiClient | https://www.fortiguard.com/webfilter: look up the domain, then use the rating-change request on the result page | Travel |
| Cisco Talos | Cisco Umbrella, Meraki, Secure Firewall | https://talosintelligence.com/reputation_center/lookup?search=lctuniversal.com (web categorization request; needs a free Cisco account) | Travel |
| Palo Alto Networks | PAN-OS URL Filtering, Prisma Access | https://urlfiltering.paloaltonetworks.com/ | Travel |
| Zscaler | Zscaler Internet Access | https://sitereview.zscaler.com/ | Travel |
| Broadcom (Symantec / Blue Coat) | Symantec WSS / ProxySG | https://sitereview.bluecoat.com/ | Travel |
| Forcepoint | Forcepoint Web Security | https://csi.forcepoint.com/ | Travel |
| Trellix (McAfee) | Trellix / McAfee Web Gateway | https://sitelookup.mcafee.com/ | Travel |
| OpenText BrightCloud (Webroot) | Many SMB routers and UTMs | https://www.brightcloud.com/tools/url-ip-lookup.php | Travel |
| Cloudflare | Cloudflare Gateway, 1.1.1.1 for Families | https://radar.cloudflare.com/domains/feedback/lctuniversal.com | Travel |
| DNSFilter | Business DNS filtering | https://www.dnsfilter.com/domain-lookup | Travel |

Vendors usually answer within 1–3 business days. Note each ticket number here once submitted.

## After submitting

- Re-test through the same FortiGate office probe (Globalping tag `u-lofitops:bwk01`). The 403 should turn into a 200 once FortiGuard updates its rating.
- Related trust signals that help ratings and email deliverability:
  - Enable DKIM in Namecheap Private Email.
  - Add a DMARC record: TXT at `_dmarc`, value `v=DMARC1; p=none; rua=mailto:reservations@lctuniversal.com`.
  - Both are DNS changes for the owner to make.

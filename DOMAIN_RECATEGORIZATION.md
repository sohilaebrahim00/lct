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

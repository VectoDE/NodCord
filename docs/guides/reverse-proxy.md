# Running behind Cloudflare and a reverse proxy

The production setup is Cloudflare in front of your own reverse proxy (for example nginx), which forwards to NodCord:

```text
Client -> Cloudflare -> own reverse proxy -> NodCord (API on PORT, client on CLIENT_PORT)
```

## TRUST_PROXY_HOPS=2

NodCord takes the client IP for rate limits and access logs from `req.ip`. Express only reads `X-Forwarded-For` as far as `trust proxy` allows, and NodCord sets that value from `TRUST_PROXY_HOPS`.

With two proxies the header the app receives looks like this:

```text
X-Forwarded-For: <anything the client sent>, <client IP added by Cloudflare>, <Cloudflare edge IP added by your proxy>
```

`TRUST_PROXY_HOPS=2` skips the two trusted hops from the right and uses the client IP that Cloudflare added. Whatever the client wrote into the header itself stays to the left and is ignored.

Set the value to the real number of proxies, never higher:

| Setup | `TRUST_PROXY_HOPS` |
| --- | --- |
| Cloudflare and own reverse proxy (production) | `2` |
| Own reverse proxy only | `1` |
| No proxy at all | `0` |

A value that is too high lets clients choose their own IP and bypass rate limits. A value that is too low counts the proxy's IP, so all users behind the same Cloudflare edge share one rate-limit bucket. Without a valid value the code falls back to `1`.

## Your proxy must only accept Cloudflare

`TRUST_PROXY_HOPS=2` assumes every request really passed through Cloudflare. If your proxy also accepts direct connections, an attacker can skip Cloudflare, send a forged `X-Forwarded-For` and pick the IP NodCord sees. So the reverse proxy (or the firewall in front of it) must only accept connections from Cloudflare's IP ranges, and NodCord's own ports must only be reachable from the proxy.

Cloudflare publishes the current ranges at <https://www.cloudflare.com/ips/> (plain lists: <https://www.cloudflare.com/ips-v4> and <https://www.cloudflare.com/ips-v6>). As of 2026-11-19 they are:

IPv4:

```text
173.245.48.0/20
103.21.244.0/22
103.22.200.0/22
103.31.4.0/22
141.101.64.0/18
108.162.192.0/18
190.93.240.0/20
188.114.96.0/20
197.234.240.0/22
198.41.128.0/17
162.158.0.0/15
104.16.0.0/13
104.24.0.0/14
172.64.0.0/13
131.0.72.0/22
```

IPv6:

```text
2400:cb00::/32
2606:4700::/32
2803:f800::/32
2405:b500::/32
2405:8100::/32
2a06:98c0::/29
2c0f:f248::/32
```

The list changes from time to time. Load it from the URLs above when you build your allow list, and refresh it regularly instead of copying this snapshot.

Example for nginx (one `allow` line per range, then deny the rest):

```nginx
server {
    listen 443 ssl;
    server_name example.com;

    # Only Cloudflare may connect (fill in every range from the lists above)
    allow 173.245.48.0/20;
    allow 2400:cb00::/32;
    # ...
    deny all;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

An IP allow list only proves that a request came from Cloudflare, not from your Cloudflare zone: any Cloudflare customer can point traffic at your origin IP. For stronger protection, add [Authenticated Origin Pulls](https://developers.cloudflare.com/ssl/origin-configuration/authenticated-origin-pull/) (mTLS between Cloudflare and your proxy) or run [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) so the origin has no open inbound port.

Do not combine this with nginx's `real_ip` module (`set_real_ip_from`, `real_ip_header`). It rewrites the address nginx appends, so the hop count NodCord expects no longer matches.

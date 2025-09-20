# poshlostios
poshlositi os repository

## Mirrors

[meex.lol (official)](https://poshlostios.meex.lol) \
[github pages (unstable)](https://meexreay.github.io/poshlostios)

## Local run

You can run PoshlostiOS on your local network with [lighttpd](https://www.lighttpd.net/)

```bash
git clone https://github.com/MeexReay/poshlostios.git
cd poshlostios
lighttpd -f lighttpd.conf -D
```

Then, your server will be available on [127.0.0.1:3000](http://127.0.0.1:3000/index.html)

![alt text](./src/assets/img/msft_logo_24.png "Microsoft")  Intelligent Cloud Global Blackbelt Kubernetes Hackfest (web-ui)
======


Running locally
------

> Install Dependencies

```bash
npm install
```

> Run with npm (this serves with the vue-cli and webpack)

```bash
npm run dev
```


Service setup
------

[Webpack Proxy Config](./vue.config.js)

This lists the proxy location for services

> e.g., ***/api/stats/inair*** 
```javascript
    '/api/flights/inair':{
        target: 'http://localhost:8004',
        changeOrigin: true,
        pathRewrite: {
          '^/api/flights/inair': '/api/stats/flights/inair'
        }
    }
```

Built with
------

[Vue Paper Dashboard](https://cristijora.github.io/vue-paper-dashboard/)

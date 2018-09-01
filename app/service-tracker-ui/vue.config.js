
const webpack = require('webpack')
module.exports = {
  configureWebpack: {
   plugins: [
     new webpack.DefinePlugin({
       'process.env': {
         'APPINSIGHTS_INSTRUMENTATIONKEY': JSON.stringify(process.env.APPINSIGHTS_INSTRUMENTATIONKEY),
         'FLIGHT_API': JSON.stringify(process.env.FLIGHT_API),
         'WEATHER_API': JSON.stringify(process.env.WEATHER_API),
         'QUAKES_API': JSON.stringify(process.env.QUAKES_API)
       }
     })
   ],
  },
 lintOnSave: false,
  devServer: {
    // show variables when running http://localhost:8080/variables
    before: function(app) {
      app.get('/variables', (req, res) => {
        var currentEnv = { 
          quakes: process.env.QUAKES_API,
          weather: process.env.WEATHER_API,
          flights: process.env.FLIGHT_API,
          insights: process.env.APPINSIGHTS_INSTRUMENTATIONKEY
         }
        res.json({ custom: currentEnv })
      })
    },
    proxy: {
      '/api/flights/current': {
        target: process.env.FLIGHT_API,
        changeOrigin: true,
        pathRewrite: {
          '^/api/flights/current': ''
        }
      },
      "/api/weather/current": {
        target: process.env.WEATHER_API,
        changeOrigin: true,
        pathRewrite: {
          "^/api/weather/current": ""
        }
      },
      "/api/quakes/current": {
        target: process.env.QUAKES_API,
        changeOrigin: true,
        pathRewrite: {
          "^/api/quakes/current": ""
        }
      },
      '/api/k8s/nodes': {
        target: 'http://localhost:3000/k8s-service/pods', // NEED TO INCORPORATE THIS
        changeOrigin: true,
        pathRewrite: {
          '^/api/k8s/nodes': ''
        }
      },
      '/api/quakes/stats': {
        target: 'http://localhost:3000/api/stats', //NEED TO CHANGE + ADD THIS PORT
        changeOrigin: true,
        pathRewrite: {
          '^/api/quakes/stats': ''
        }
      }
    }
  }
};

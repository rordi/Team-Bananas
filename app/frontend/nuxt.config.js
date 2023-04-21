const API_BASE_URL = 'https://api.reviewers.ch/' // on prod use: https://api.reviewers.ch/ and on local use http://localhost:5000/

export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'server', // currently we use 'server' target as the app needs to run over Node.js with middleware proxy for Solr until Scilit.net backend has the API endpoints ready

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Reviewer Resolver',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        hid: 'description',
        name: 'description',
        content: 'Reviewer Resolver is a prototypical software to match bias-free reviewers for scholarly documents.'
      }
    ],
    link: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;700&display=swap' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  loading: {
    color: 'blue',
    height: '5px'
  },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/vue-numeral-filter.js', ssr: false }
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/stylelint
    '@nuxtjs/stylelint-module',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
    // https://www.npmjs.com/package/@nuxtjs/fontawesome
    ['@nuxtjs/fontawesome', {
      icons: {
        solid: true
      }
    }]
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/proxy', // use proxy against all APIs to circumvent CORS validation issues
    '@nuxtjs/style-resources',
    '@nuxtjs/toast'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  // config for module: @nuxtjs/proxy - see https://github.com/nuxt-community/proxy-module
  proxy: {
    // API request 1: search semantically related publications
    '/api/v1/search': {
      target: API_BASE_URL,
      pathRewrite: {
        '^/api/v1': ''
      },
      ws: false,
      secure: false,
      proxyTimeout: 60000,
      timeout: 60000,
      followRedirects: false
    },
    '/api/v1/refine': {
      target: API_BASE_URL,
      pathRewrite: {
        '^/api/v1': ''
      },
      ws: false,
      secure: false,
      proxyTimeout: 60000,
      timeout: 60000,
      followRedirects: false
    },
    '/api/v1/resolve': {
      target: API_BASE_URL,
      pathRewrite: {
        '^/api/v1': ''
      },
      ws: false,
      secure: false,
      proxyTimeout: 60000,
      timeout: 60000,
      followRedirects: false
    }
  },

  styleResources: {},

  toast: {
    position: 'top-right' // default position for toasts
  },

  // Nuxt router config (because we deploy the web-app into Scilit Symfony app, we can use a base routing)
  router: {
    base: '/'
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    babel: {
      plugins: [
        ['@babel/plugin-proposal-private-methods', { loose: true }]
      ]
    },
    postcss: {
      plugins: {
        'postcss-custom-properties': false
      }
    }
  }
}

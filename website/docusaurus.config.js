module.exports = {
  title: 'install-custom-font',
  tagline: 'Use an npm package to install custom fonts in a cross-platform way',
  url: 'https://tbjgolden.github.io',
  baseUrl: '/install-custom-font/',
  favicon: 'img/favicon.ico',
  organizationName: 'tbjgolden',
  projectName: 'install-custom-font',
  themeConfig: {
    navbar: {
      title: 'install-custom-font',
      logo: {
        alt: 'install-custom-font logo',
        src: 'img/logo.svg'
      },
      links: [
        {
          to: 'docs/doc1',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left'
        },
        { to: 'docs/api/index', label: 'API', position: 'left' },
        { to: 'blog', label: 'Blog', position: 'left' },
        {
          href:
            'https://github.com/tbjgolden/install-custom-font',
          label: 'GitHub',
          position: 'right'
        }
      ]
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Style Guide',
              to: 'docs/doc1'
            },
            {
              label: 'Second Doc',
              to: 'docs/doc2'
            }
          ]
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href:
                'https://stackoverflow.com/questions/tagged/install-custom-font'
            }
            /*
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/install-custom-font',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/install-custom-font',
            },
            */
          ]
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: 'blog'
            },
            {
              label: 'GitHub',
              href:
                'https://github.com/tbjgolden/install-custom-font'
            }
          ]
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} install-custom-font (Tom Golden). Built with Docusaurus.`
    }
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebar'),
          editUrl:
            'https://github.com/tbjgolden/install-custom-font/edit/master/website/'
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/tbjgolden/install-custom-font/edit/master/website/blog/'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      }
    ]
  ]
}

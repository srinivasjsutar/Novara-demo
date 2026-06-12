import { usePageContext } from 'vike-react/usePageContext'

export default function Head() {
  const { config } = usePageContext()

  const description = config?.metaDescription || ''

  return (
    <>
      {description && (
        <meta name="description" content={description} />
      )}
      {config?.keywords && (
        <meta name="keywords" content={config.keywords} />
      )}
      <link rel="icon" href="/images/logo-icon.svg" />
      <link rel="apple-touch-icon" href="/images/logo-icon.svg" />
      <meta name="theme-color" content="#000000" />
      <meta name="robots" content="index, follow" />
      <script dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-WFF2PTMR');`,
      }} />
    </>
  )
}
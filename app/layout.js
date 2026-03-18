export const metadata = {
  title: 'VPNStore BD — Best VPN & Gift Cards',
  description: 'Buy VPN subscriptions and gift cards at the lowest price in Bangladesh.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, background: '#050810', color: '#e8eaf6', fontFamily: "'Syne', sans-serif" }}>
        {children}
      </body>
    </html>
  )
}

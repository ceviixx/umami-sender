export const metadata = {
  title: {
    default: 'UmamiSender',
    template: '%s | UmamiSender',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/umamisender.png',
    apple: '/umamisender.png',
  },
  description: 'UmamiSender is a tool to send statistics per email or webhook from Umami cloud and self-hosted.',
}

export default function RootLayout({children}: {children: React.ReactNode;}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
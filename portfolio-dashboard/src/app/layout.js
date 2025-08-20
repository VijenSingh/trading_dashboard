import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* <nav>
          <a href="/">Home</a>
          <a href="/trades">Trades</a>
        </nav> */}
        <main>{children}</main>
      </body>
    </html>
  );
}

import GlobalStyles from "@/components/GlobalStyles";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Nour Nails",
  description: "Book your next manicure or pedicure at Nour Nails.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <GlobalStyles />
        <Navbar />
        {children}
      </body>
    </html>
  );
}

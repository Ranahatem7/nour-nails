import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Nour Nails",
  description: "Nail salon booking",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
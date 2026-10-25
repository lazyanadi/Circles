import { StoreProvider } from "@/lib/store";
import "./app.css";

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <p className="proto">Prototype. UPI, eKYC and the lending partner are simulated; no real money moves.</p>
      {children}
    </StoreProvider>
  );
}

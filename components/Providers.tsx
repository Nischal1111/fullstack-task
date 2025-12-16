 "use client";

 import { HeroUIProvider } from "@heroui/react";

 interface ProvidersProps {
   children: React.ReactNode;
 }

 export function Providers({ children }: ProvidersProps) {
   return <HeroUIProvider>{children}</HeroUIProvider>;
 }



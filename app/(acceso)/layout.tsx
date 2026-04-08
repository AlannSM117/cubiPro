export default function AccesoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Usamos una estructura limpia
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}
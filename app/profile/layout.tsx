import Sidebar from '../components/Sidebar';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#121212' }}>
      <Sidebar />
      {children}
    </div>
  );
} 
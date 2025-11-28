import { Header, Container } from './components/layout';

function App() {
  const handleExportClick = () => {
    // Placeholder for future export functionality
    console.log('Export clicked');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onExportClick={handleExportClick} />
      <main>
        <Container>
          {/* Test Tailwind classes - bg-blue-500 */}
          <div className="rounded-lg bg-blue-500 p-4 text-white shadow">
            <p>Tailwind CSS is working! This box uses bg-blue-500.</p>
          </div>
        </Container>
      </main>
    </div>
  );
}

export default App;

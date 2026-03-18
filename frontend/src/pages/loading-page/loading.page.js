import { LoadingIndicator } from "../../components/LoadingIndicator/LoadingIndicator";

function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C1D1F] text-white">
      <LoadingIndicator
        type="line-spinner"
        size="md"
        label="Loading data..."
      />
    </div>
  );
}

export default LoadingPage;
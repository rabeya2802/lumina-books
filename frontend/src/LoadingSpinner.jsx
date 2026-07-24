/**
 * Loading Spinner Component
 * A beautiful, minimal spinner for loading states
 */
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner Animation */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-amber-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-amber-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        
        {/* Loading Text */}
        <p className="text-stone-600 font-medium animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
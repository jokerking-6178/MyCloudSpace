const FullPageSpinner = ({ label }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
    <div className="text-center">
      <div
        className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"
        role="status"
        aria-label="Loading"
      />
      {label && <p className="mt-4 text-sm text-gray-600">{label}</p>}
    </div>
  </div>
);

export default FullPageSpinner;

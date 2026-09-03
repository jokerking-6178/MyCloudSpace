import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-6">
    <div className="text-center max-w-md">
      <p className="text-6xl font-bold text-blue-600 mb-3">404</p>
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">Page not found</h1>
      <p className="text-sm text-gray-600 mb-8">
        That page does not exist. It may have been moved or the link may be wrong.
      </p>
      <Link
        to="/"
        className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all"
      >
        Back to home
      </Link>
    </div>
  </div>
);

export default NotFound;

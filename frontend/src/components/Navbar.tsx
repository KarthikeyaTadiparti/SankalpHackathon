import { Link, useLocation, useNavigate } from "react-router-dom";
import { TriangleAlert } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  // Check if user is logged in by checking localStorage
  const userId = localStorage.getItem("userId");

  const handleLogout = () => {
    localStorage.removeItem("userId"); // Remove userId
    // Optionally, call backend logout to clear JWT cookie
    navigate("/"); // Redirect to home page
    window.location.reload(); // Refresh to re-render Navbar
  };

  return (
    <nav className="sticky top-0 w-full bg-background border-b border-navbar-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex gap-2 text-xl font-semibold text-foreground">
              <TriangleAlert />ScamCheck
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                to="/"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive("/") ? "text-foreground" : "text-dark-gray hover:text-foreground"
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive("/about") ? "text-foreground" : "text-dark-gray hover:text-foreground"
                }`}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive("/contact") ? "text-foreground" : "text-dark-gray hover:text-foreground"
                }`}
              >
                Contact
              </Link>

              {/* Conditional Links */}
              {!userId ? (
                <>
                  <Link
                    to="/signup"
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      isActive("/signup") ? "text-foreground" : "text-dark-gray hover:text-foreground"
                    }`}
                  >
                    Signup
                  </Link>
                  <Link
                    to="/login"
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      isActive("/login") ? "text-foreground" : "text-dark-gray hover:text-foreground"
                    }`}
                  >
                    Login
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-medium text-dark-gray hover:text-foreground transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

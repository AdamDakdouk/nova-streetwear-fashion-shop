import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="font-heading text-5xl font-bold text-ink">404</p>
      <h1 className="mt-2 font-heading text-lg font-semibold text-ink">Page not found</h1>
      <p className="mt-1 text-sm text-muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-6">
        <Button>Back to Products</Button>
      </Link>
    </div>
  );
}

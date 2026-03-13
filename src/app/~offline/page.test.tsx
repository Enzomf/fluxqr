import { render, screen } from "@/test/utils";
import OfflinePage from "./page";

describe("OfflinePage", () => {
  it("renders the FluxQR logo image", () => {
    render(<OfflinePage />);
    expect(screen.getByRole("img", { name: "FluxQR" })).toBeInTheDocument();
  });

  it('renders the "You\'re offline" heading', () => {
    render(<OfflinePage />);
    expect(screen.getByRole("heading", { name: /you're offline/i })).toBeInTheDocument();
  });

  it('renders a "Try again" link pointing to /', () => {
    render(<OfflinePage />);
    const link = screen.getByRole("link", { name: /try again/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders description text about connection", () => {
    render(<OfflinePage />);
    expect(screen.getByText(/connection/i)).toBeInTheDocument();
  });
});

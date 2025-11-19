export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">Husky</div>
              <div className="text-sm opacity-80">Tracker</div>
            </div>
            <p className="text-sm opacity-90 max-w-md">
              One stop solution for all Northeastern students, professors, faculties, employees, alumnus.
            </p>
            <div className="space-y-2 text-sm opacity-80">
              <div>Privacy policy</div>
              <div>Legal terms</div>
              <div>University policies</div>
              <div>Terms and conditions</div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <a href="#" className="hover:opacity-80 transition-opacity">
              Home
            </a>
            <a href="#" className="hover:opacity-80 transition-opacity">
              Profile
            </a>
            <a href="#" className="hover:opacity-80 transition-opacity">
              Company
            </a>
            <a href="#" className="hover:opacity-80 transition-opacity">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

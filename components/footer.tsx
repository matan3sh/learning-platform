const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="flex justify-center border-t">
      <div className="p-5 flex-center">
        {currentYear} &copy; All rights reserved.
      </div>
    </footer>
  )
}

export default Footer

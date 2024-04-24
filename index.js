import http from 'http';
import puppeteer from 'puppeteer';

const server = http.createServer(async (req, res) => {
  if (req.url === '/generate-pdf') {
    try {
      const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.goto('https://jacoblind.me/resume/download', { waitUntil: 'networkidle2' });
      await page.setViewport({ width: 794, height: 1123 });

      // Generate PDF and get it as a buffer
      const pdfBuffer = await page.pdf({ 
        printBackground: true,
        format: 'A4'
      });
      await browser.close();

      // Set headers for PDF download
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=resume.pdf',
        'Content-Length': pdfBuffer.length,
      });

      // Send the PDF buffer to the client and close the server after sending
      res.end(pdfBuffer, () => {
        console.log('PDF sent to client, closing server.');
        server.close(() => {
          console.log('Server closed.');
        });
      });
    } catch (error) {
      console.error(error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('An error occurred while generating the PDF.');
    }
  } else {
    // Handle non-PDF requests or 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
import http from 'http';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://jacoblind.me');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle pre-flight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  const auth = { 
    login: process.env.BASIC_AUTH_USERNAME, 
    password: process.env.BASIC_AUTH_PASSWORD 
  };

  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

  if (!login || !password || login !== auth.login || password !== auth.password) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="401"' });
    res.end('Access denied');
    return;
  }

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
        console.log('PDF sent to client.');
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
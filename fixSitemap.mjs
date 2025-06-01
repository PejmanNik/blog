import fs from 'fs/promises';
import { parseStringPromise, Builder } from 'xml2js';

const sitemapPath = './dist/sitemap-0.xml';
const newUrl = {
  loc: 'https://pejmannik.dev',
};

try {
  // read and parse the XML
  const xmlData = await fs.readFile(sitemapPath, 'utf-8');
  const parsed = await parseStringPromise(xmlData);

  parsed.urlset.url.push({ loc: [newUrl.loc] });
  
  const builder = new Builder();
  const updatedXml = builder.buildObject(parsed);
  
  await fs.writeFile(sitemapPath, updatedXml, 'utf-8');
  console.log('✓ URL added to sitemap');
} catch (err) {
  console.error('Failed to update sitemap:', err);
}
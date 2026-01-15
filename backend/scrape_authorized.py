import requests
import xml.etree.ElementTree as ET
import pandas as pd
from urllib.parse import urljoin
import time

# --- CONFIGURATION ---
AUTH_KEY = "infinity-learn-scraper-secret-2026"  # Must match the key in middleware.ts
MAIN_SITEMAP = "https://getschoolsinfo.com/sitemap.xml"
OUTPUT_FILE = "getschoolsinfo_urls.csv"
# ---------------------

def fetch_sitemap(url):
    """Fetch sitemap content with authorization header"""
    try:
        headers = {
            'User-Agent': 'AuthorizedScraper/1.0',
            'x-scraper-auth': AUTH_KEY  # <--- THIS IS THE MAGIC KEY
        }
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 403:
            print(f"❌ AUTH FAILED: {url} (Check your key!)")
            return None
            
        response.raise_for_status()
        return response.content
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def parse_sitemap(content):
    """Parse sitemap XML and extract URLs"""
    try:
        root = ET.fromstring(content)
        
        # Handle different namespace formats
        namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        
        # Check if this is a sitemap index (contains other sitemaps)
        sitemaps = root.findall('.//ns:sitemap/ns:loc', namespace)
        if sitemaps:
            return [sitemap.text for sitemap in sitemaps], 'index'
        
        # Otherwise, extract regular URLs
        urls = root.findall('.//ns:url/ns:loc', namespace)
        if urls:
            return [url.text for url in urls], 'urlset'
        
        return [], 'empty'
    except Exception as e:
        print(f"Error parsing sitemap: {e}")
        return [], 'error'

def scrape_all_sitemaps(main_sitemap_url):
    """Recursively scrape all sitemaps and collect URLs"""
    all_urls = []
    visited_sitemaps = set()
    sitemaps_to_process = [main_sitemap_url]
    
    while sitemaps_to_process:
        current_sitemap = sitemaps_to_process.pop(0)
        
        if current_sitemap in visited_sitemaps:
            continue
        
        print(f"Processing: {current_sitemap}")
        visited_sitemaps.add(current_sitemap)
        
        content = fetch_sitemap(current_sitemap)
        if not content:
            continue
        
        urls, sitemap_type = parse_sitemap(content)
        
        if sitemap_type == 'index':
            print(f"  Found {len(urls)} sub-sitemaps")
            sitemaps_to_process.extend(urls)
        elif sitemap_type == 'urlset':
            print(f"  Found {len(urls)} URLs")
            all_urls.extend(urls)
        
        # We can go faster now since we are authorized, but let's keep it safe
        time.sleep(0.1) 
    
    return all_urls

def main():
    print("Starting AUTHORIZED sitemap scraping...")
    print(f"Key used: {AUTH_KEY}")
    print("="*60)
    
    # Scrape all URLs
    all_urls = scrape_all_sitemaps(MAIN_SITEMAP)
    
    # Remove duplicates
    unique_urls = list(set(all_urls))
    
    # Create DataFrame
    df = pd.DataFrame({
        'url': unique_urls
    })
    
    # Save to CSV
    df.to_csv(OUTPUT_FILE, index=False)
    
    # Print summary
    print("\n" + "="*60)
    print("SCRAPING COMPLETE!")
    print("="*60)
    print(f"Total URLs found: {len(all_urls)}")
    print(f"Unique URLs: {len(unique_urls)}")
    print(f"Duplicates removed: {len(all_urls) - len(unique_urls)}")
    print(f"\nSaved to: {OUTPUT_FILE}")
    print("\nFirst 10 URLs:")
    print(df.head(10).to_string(index=False))

if __name__ == "__main__":
    main()

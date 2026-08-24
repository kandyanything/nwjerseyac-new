import requests
from bs4 import BeautifulSoup
import os
import json
import time
from urllib.parse import urljoin, urlparse
import re

# School data
schools = [
    {"name": "Academy of Saint Elizabeth", "website": "http://www.academyofsaintelizabeth.org", "filename": "academy-saint-elizabeth.png"},
    {"name": "Boonton High School", "website": "http://www.booschools.org/bhs", "filename": "boonton.png"},
    {"name": "Butler High School", "website": "http://www.butlerschools.org", "filename": "butler.png"},
    {"name": "Chatham High School", "website": "http://www.chatham-nj.org", "filename": "chatham.png"},
    {"name": "Delbarton School", "website": "http://www.delbarton.org", "filename": "delbarton.png"},
    {"name": "Dover High School", "website": "http://www.dover.k12.nj.us/", "filename": "dover.png"},
    {"name": "Hackettstown High School", "website": "http://www.hckschools.org", "filename": "hackettstown.png"},
    {"name": "Hanover Park High School", "website": "http://www.hanoverpark.org", "filename": "hanover-park.png"},
    {"name": "High Point High School", "website": "http://www.highpoint.k12.nj.us/", "filename": "high-point.png"},
    {"name": "Hopatcong High School", "website": "http://www.hopatcongschools.org/", "filename": "hopatcong.png"},
    {"name": "Jefferson Township High School", "website": "http://www.jefftwp.org", "filename": "jefferson.png"},
    {"name": "Kinnelon High School", "website": "http://www.kinnelonpublicschools.org/khs", "filename": "kinnelon.png"},
    {"name": "Kittatinny High School", "website": "http://www.krsd.org", "filename": "kittatinny.png"},
    {"name": "Lenape Valley High School", "website": "http://www.lvrhs.com/", "filename": "lenape-valley.png"},
    {"name": "Madison High School", "website": "http://www.madisonnjps.org/mhs", "filename": "madison.png"},
    {"name": "Montville High School", "website": "http://www.montville.net/mths", "filename": "montville.png"},
    {"name": "Morris Catholic High School", "website": "http://www.morriscatholic.org", "filename": "morris-catholic.png"},
    {"name": "Morris County School of Technology", "website": "https://www.mcts.org/", "filename": "morris-tech.png"},
    {"name": "Morris Hills High School", "website": "http://www.mhrd.org/schools/mhhs/", "filename": "morris-hills.png"},
    {"name": "Morris Knolls High School", "website": "http://www.mhrd.org/schools/mkhs/", "filename": "morris-knolls.png"},
    {"name": "Morristown Beard School", "website": "http://www.morrisbear.org", "filename": "morristown-beard.png"},
    {"name": "Morristown High School", "website": "http://www.morristown.k12.nj.us/mhs", "filename": "morristown.png"},
    {"name": "Mount Olive High School", "website": "http://www.mountoliveboe.com", "filename": "mount-olive.png"},
    {"name": "Mountain Lakes High School", "website": "http://www.mtlakes.org/mlhs", "filename": "mountain-lakes.png"},
    {"name": "Newton High School", "website": "http://www.newtonnj.org", "filename": "newton.png"},
    {"name": "North Warren", "website": "http://www.nwarren.org", "filename": "north-warren.png"},
    {"name": "Parsippany High School", "website": "http://www.pars-troy.k12.nj.us/phs", "filename": "parsippany.png"},
    {"name": "Parsippany Hills High School", "website": "http://www.pars-troy.k12.nj.us/phhs", "filename": "parsippany-hills.png"},
    {"name": "Pequannock High School", "website": "http://www.pequannock.org/pths", "filename": "pequannock.png"},
    {"name": "Pope John XXIII High School", "website": "http://www.popejohn.org", "filename": "pope-john.png"},
    {"name": "Randolph Township School District", "website": "http://www.ranmac.org", "filename": "randolph.png"},
    {"name": "Roxbury High School", "website": "http://www.roxbury.org/rhs", "filename": "roxbury.png"},
    {"name": "Sparta High School", "website": "http://www.sparta.org/shs", "filename": "sparta.png"},
    {"name": "Sussex County Tech High School", "website": "http://www.scts.org", "filename": "sussex-tech.png"},
    {"name": "Vernon Township High School", "website": "http://www.vtsd.com/domain/12", "filename": "vernon.png"},
    {"name": "Villa Walsh Academy", "website": "http://www.villawalsh.org", "filename": "villa-walsh.png"},
    {"name": "Wallkill Valley High School", "website": "http://www.wvregional.org", "filename": "wallkill-valley.png"},
    {"name": "West Morris Central", "website": "http://www.wmchs.org", "filename": "west-morris-central.png"},
    {"name": "West Morris Mendham", "website": "http://www.wmhighschool.org", "filename": "west-morris-mendham.png"},
    {"name": "Whippany Park High School", "website": "http://www.hanoverpark.org/domain/67", "filename": "whippany-park.png"}
]

def find_logo_on_page(url, school_name):
    """Try to find a logo image on the school's website"""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # Strategy 1: Look for images with 'logo' in src, alt, or class
        logo_patterns = ['logo', 'emblem', 'seal', 'badge']

        for img in soup.find_all('img'):
            img_src = img.get('src', '')
            img_alt = img.get('alt', '').lower()
            img_class = ' '.join(img.get('class', [])).lower()

            # Check if this looks like a logo
            is_logo = any(pattern in img_src.lower() or
                         pattern in img_alt or
                         pattern in img_class
                         for pattern in logo_patterns)

            if is_logo:
                # Convert relative URL to absolute
                img_url = urljoin(url, img_src)
                print(f"  Found potential logo: {img_url}")
                return img_url

        # Strategy 2: Look for favicon/apple-touch-icon
        for link in soup.find_all('link', rel=re.compile('icon|apple-touch-icon', re.I)):
            icon_url = urljoin(url, link.get('href', ''))
            if icon_url:
                print(f"  Found icon: {icon_url}")
                return icon_url

        print(f"  No logo found on page")
        return None

    except Exception as e:
        print(f"  Error accessing website: {str(e)}")
        return None

def download_logo(logo_url, output_path):
    """Download the logo image"""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(logo_url, headers=headers, timeout=10)
        response.raise_for_status()

        # Check if it's actually an image
        content_type = response.headers.get('content-type', '')
        if 'image' not in content_type.lower():
            print(f"  Warning: Downloaded file is not an image (content-type: {content_type})")
            return False

        with open(output_path, 'wb') as f:
            f.write(response.content)

        file_size = len(response.content)
        print(f"  Downloaded: {file_size} bytes")
        return True

    except Exception as e:
        print(f"  Error downloading: {str(e)}")
        return False

def main():
    # Create logos directory
    logos_dir = os.path.join('images', 'logos')
    os.makedirs(logos_dir, exist_ok=True)

    success_count = 0
    failed_schools = []

    print(f"Starting logo download for {len(schools)} schools...\n")

    for i, school in enumerate(schools, 1):
        print(f"[{i}/{len(schools)}] {school['name']}")
        print(f"  Website: {school['website']}")

        # Try to find and download logo
        logo_url = find_logo_on_page(school['website'], school['name'])

        if logo_url:
            output_path = os.path.join(logos_dir, school['filename'])
            if download_logo(logo_url, output_path):
                success_count += 1
                print(f"  ✓ Success!\n")
            else:
                failed_schools.append(school['name'])
                print(f"  ✗ Failed to download\n")
        else:
            failed_schools.append(school['name'])
            print(f"  ✗ No logo found\n")

        # Be polite - wait between requests
        time.sleep(2)

    # Summary
    print("=" * 70)
    print(f"\nDownload complete!")
    print(f"Successfully downloaded: {success_count}/{len(schools)} logos")

    if failed_schools:
        print(f"\nFailed schools ({len(failed_schools)}):")
        for school in failed_schools:
            print(f"  - {school}")
        print("\nThese logos will need to be downloaded manually or found through alternative sources.")

if __name__ == "__main__":
    main()

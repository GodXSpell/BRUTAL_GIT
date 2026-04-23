import re

with open('landing_page.html', 'r') as f:
    content = f.read()

# Extract main tag
main_match = re.search(r'<main.*?>(.*?)</main>', content, re.DOTALL)
if not main_match:
    print("Main not found")
    exit(1)
    
main_content = main_match.group(0)

# Convert class to className
main_content = main_content.replace('class="', 'className="')

# Convert inline styles or html comments if necessary
main_content = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', main_content)

# Fix void elements (br, img, input, hr)
main_content = re.sub(r'<br>', r'<br/>', main_content)
main_content = re.sub(r'<img([^>]*[^/])>', r'<img\1/>', main_content)
main_content = re.sub(r'<input([^>]*[^/])>', r'<input\1/>', main_content)

# Fix inline styles (if any, although tailwind usually doesn't have many)
# There are no style= attributes in the HTML based on what I saw.

jsx_code = f"""import React from 'react';

export default function LandingPage() {{
  return (
    {main_content}
  );
}}
"""

with open('app/page.tsx', 'w') as f:
    f.write(jsx_code)

print("Conversion done.")

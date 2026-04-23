import re
import sys
import os

def convert_html_to_jsx(input_file, output_file, component_name):
    with open(input_file, 'r') as f:
        content = f.read()

    main_match = re.search(r'<main.*?>(.*?)</main>', content, re.DOTALL)
    if not main_match:
        print(f"Main not found in {input_file}")
        sys.exit(1)
        
    main_content = main_match.group(0)

    # Convert class to className
    main_content = main_content.replace('class="', 'className="')
    main_content = main_content.replace('for="', 'htmlFor="')
    main_content = main_content.replace('tabindex="', 'tabIndex="')
    main_content = main_content.replace('readonly', 'readOnly')
    main_content = main_content.replace('checked', 'checked={true}')
    # Convert inline SVG styles or html comments if necessary
    main_content = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', main_content)

    # Fix void elements (br, img, input, hr)
    main_content = re.sub(r'<br>', r'<br/>', main_content)
    main_content = re.sub(r'<img([^>]*[^/])>', r'<img\1/>', main_content)
    main_content = re.sub(r'<input([^>]*[^/])>', r'<input\1/>', main_content)
    main_content = re.sub(r'<hr([^>]*[^/])>', r'<hr\1/>', main_content)
    main_content = re.sub(r'<link([^>]*[^/])>', r'<link\1/>', main_content)

    jsx_code = f"""import React from 'react';
import Link from 'next/link';

export default function {component_name}() {{
  return (
    {main_content}
  );
}}
"""

    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w') as f:
        f.write(jsx_code)

    print(f"Conversion done for {input_file} -> {output_file}")

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python convert.py <input.html> <output.tsx> <ComponentName>")
        sys.exit(1)
    convert_html_to_jsx(sys.argv[1], sys.argv[2], sys.argv[3])

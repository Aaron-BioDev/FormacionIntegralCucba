import os
import re

def fix_html_files(root_dir):
    # Regex patterns
    FORM_PATTERN = re.compile(r'(?i)\.\./\.\./Formulario de Registro/Registro talleres\.html')
    TALLERES_PATTERN = re.compile(r'(?i)(\.\./){1,2}Talleres CUCBA/.*?/index\.html')
    HTML_EXT_PATTERN = re.compile(r'(?i)(href|src)=([\"\'])(.*?)\.html([\"\'])')

    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".html"):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                # Apply replacements
                new_content = FORM_PATTERN.sub('/formulario-de-registro/register-talleres', content)
                new_content = TALLERES_PATTERN.sub('/carrusel', new_content)
                new_content = HTML_EXT_PATTERN.sub(r'\1=\2\3\4', new_content)
                
                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed: {path}")

if __name__ == "__main__":
    fix_html_files('z:\\Games\\formacion-integra-cucba')

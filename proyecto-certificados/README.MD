# 🎓 Sistema de Emisión de Certificados Digitales (CUCBA-Studio)
## Centro Universitario de Ciencias Biológicas y Agropecuarias (CUCBA) - Universidad de Guadalajara

**CUCBA-Studio** es una solución tecnológica avanzada diseñada para automatizar y estandarizar la expedición de reconocimientos institucionales. Este sistema optimiza la gestión administrativa al procesar bases de datos masivas y generar documentos individuales personalizados con validez oficial para la comunidad universitaria.

---

## 🚀 Especificaciones Técnicas (Stack Tecnológico)

El sistema opera bajo el paradigma de **Client-Side Processing**, garantizando que el procesamiento de datos personales nunca salga del equipo local:

* **SheetJS (XLSX v0.18.5):** Motor para el análisis de objetos binarios de Excel y gestión de metadatos.
* **html2canvas v1.4.1:** Algoritmo de renderizado para conversión de DOM a mapas de bits de alta fidelidad.
* **jsPDF v2.5.1:** Motor de generación de documentos vectoriales para el encapsulado en formato PDF.
* **JSZip v3.10.1:** Tecnología de compresión de archivos para empaquetado masivo (.ZIP).
* **Google Fonts API:** Integración de tipografías institucionales.

---

## 📊 Lógica Académica y de Filtrado

El sistema valida automáticamente el cumplimiento de la normativa de Formación Integral:

### 1. Regla del 80% de Asistencias
El estatus de cada alumno se determina bajo el estricto criterio de participación mínima obligatoria en cada taller:
* **APROBADO:** Alumnos que cumplieron con el **80% o más** de asistencias totales del taller. El sistema detecta esta etiqueta y genera el certificado automáticamente.
* **REPROBADO:** Alumnos con asistencias inferiores al **80%**. El sistema identifica esta condición y **omite** la generación del documento para asegurar la integridad académica de la constancia.

### 2. Estructura de Datos (Excel)
Para asegurar la interoperabilidad, el archivo fuente debe contar con las columnas: `Nombre Completo`, `Carrera`, `FOLIO DE ALUMNO` y `ESTATUS`. El folio se utiliza como nombre único de archivo para evitar duplicidad.

---

## 🔐 Seguridad y Cumplimiento Legal

En cumplimiento con la **Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados**, este sistema garantiza:
1.  **Privacidad Absoluta:** No requiere conexión a internet para procesar datos. Ninguna información se sube a nubes externas.
2.  **Borrado Seguro:** Al cerrar el navegador, se elimina cualquier rastro de la base de datos de la memoria RAM.

---

## 📝 Licencia y Notas de Desarrollo

* **Uso Institucional:** Sistema desarrollado exclusivamente para el **Centro Universitario de Ciencias Biológicas y Agropecuarias (CUCBA)** de la **Universidad de Guadalajara**.
* **Código Abierto (Open Source):** Este proyecto es de código abierto, permitiendo su auditoría y transparencia en el manejo de información.
* **Evolución y Mejora:** El sistema es un proyecto dinámico que puede ser mejorado y está sujeto a cambios para adaptarse a nuevas normativas institucionales o actualizaciones tecnológicas.

---

## ✍️ Derechos de Autor y Contacto

Este sistema es propiedad intelectual y creación de:
**Oscar Aaron Guzman Hinojosa**

Para soporte técnico, sugerencias de mejora o colaboración en el código, puede contactar a través de los siguientes medios:

* **📧 Correo Institucional:** [oscar.guzman6142@alumnos.udg.mx](mailto:oscar.guzman6142@alumnos.udg.mx)
* **📧 Correo Personal:** [aaronguzman3335@gmail.com](mailto:aaronguzman3335@gmail.com)

**Formación Integral CUCBA • Universidad de Guadalajara • 2026**